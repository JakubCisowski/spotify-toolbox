import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function authorize() {
  const authorizationResponse = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(authorizationResponse.body.access_token);
}

export default async function fetchPlaylistInfo(playlistId: string) {
  await authorize();
  let playlistInfo = await spotifyApi.getPlaylist(playlistId);
  let playlistAllTracks = await fetchAllSongs(playlistId);

  return {
    name: playlistInfo.body.name,
    imageUrl: playlistInfo.body.images[0]!.url,
    genres: await fetchPlaylistGenres(playlistAllTracks),
  };
}

async function fetchAllSongs(playlistId: string) {
  var data = await spotifyApi.getPlaylistTracks(playlistId);
  var batchesAmount = Math.floor(data.body.total / 100) + 1;
  var promises = [];
  for (let batchNum = 0; batchNum < batchesAmount; batchNum++) {
    var promise = await spotifyApi.getPlaylistTracks(playlistId, {
      offset: batchNum * 100,
    });
    promises.push(promise);
  }

  var rawSongData = await Promise.all(promises);
  var songs: SpotifyApi.PlaylistTrackObject[] = [];
  for (let i = 0; i < rawSongData.length; i++) {
    if (rawSongData[i] != undefined) {
      songs = songs.concat(rawSongData[i]!.body.items);
    }
  }

  return songs;
}

async function fetchPlaylistGenres(tracks: SpotifyApi.PlaylistTrackObject[]) {
  var tracksArtistIds: string[][] = [];
  let artistsIds: string[] = [];

  for (var i = 0; i < tracks.length; i++) {
    // Each track
    var trackArtistIds: string[] = [];
    var track = tracks[i]!.track;
    if (track == null) {
      continue;
    }
    for (var j = 0; j < track.artists.length; j++) {
      let artist = track.artists[j]!;
      // Each artist in track
      if (artist.name.length > 0 && artist.id != null) {
        trackArtistIds.push(artist.id);
      }

      if (!artistsIds.includes(artist.id)) {
        artistsIds.push(artist.id);
      }
    }
    if (trackArtistIds.length > 0) {
      tracksArtistIds.push(trackArtistIds);
    }
  }

  let artistGenres: { artistId: string; genres: string[] }[] = [];

  for (let artistId of artistsIds) {
    // ? Potential 429 status code fix, but not sure if it's needed.
    // ? https://github.com/thelinmichael/spotify-web-api-node/issues/217#issuecomment-870130885
    await spotifyApi
      .getArtist(artistId)
      .then(function (data) {
        artistGenres.push({ artistId: artistId, genres: data.body.genres });
      })
      .catch((err) => console.log(err));
  }

  let tracksGenres: string[][] = [];

  for (let track of tracksArtistIds) {
    let trackGenres: string[] = [];
    for (let artistId of track) {
      for (let genre of artistGenres.find((x) => x.artistId == artistId)!
        .genres) {
        if (!trackGenres.includes(genre)) {
          trackGenres.push(genre);
        }
      }
    }
    tracksGenres.push(trackGenres);
  }

  return countGenresPercentage(tracksGenres);
}

function countGenresPercentage(tracksGenres: string[][]) {
  var genreAmounts: {
    genreName: string;
    count: number;
    percentage: number;
  }[] = [];

  for (var i = 0; i < tracksGenres.length; i++) {
    for (var j = 0; j < tracksGenres[i]!.length; j++) {
      let genreName = tracksGenres[i]![j];
      let genreAmountsElement = genreAmounts.find(
        (x) => x.genreName === genreName
      );

      if (genreAmountsElement === undefined) {
        genreAmounts.push({
          genreName: genreName!,
          count: 1,
          percentage: 0,
        });
      } else {
        genreAmountsElement.count++;
      }
    }
  }

  // Calculate percentage of each genre and sort
  genreAmounts = genreAmounts
    .map((x) => {
      x.percentage = Math.round((x.count / tracksGenres.length) * 100);
      return x;
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Add unclassified tracks info;
  // ? Maybe pass this info separately
  var unclassifiedTracksAmount = 0;
  for (var i = 0; i < tracksGenres.length; i++) {
    if (tracksGenres[i]!.length == 0) {
      unclassifiedTracksAmount++;
    }
  }
  var unclassifiedTracksPercentage = Math.round(
    (unclassifiedTracksAmount / tracksGenres.length) * 100
  );

  genreAmounts.push({
    genreName: 'unclassified',
    count: unclassifiedTracksAmount,
    percentage: unclassifiedTracksPercentage,
  });

  return genreAmounts;
}
