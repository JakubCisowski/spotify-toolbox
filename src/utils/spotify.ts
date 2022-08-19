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
  let data = await spotifyApi.getPlaylistTracks(playlistId);
  let batchesAmount = Math.floor(data.body.total / 100) + 1;
  let promises = [];
  for (let batchIndex = 0; batchIndex < batchesAmount; batchIndex++) {
    let promise = await spotifyApi.getPlaylistTracks(playlistId, {
      offset: batchIndex * 100,
    });
    promises.push(promise);
  }

  let rawSongData = await Promise.all(promises);
  let songs: SpotifyApi.PlaylistTrackObject[] = [];
  for (let i = 0; i < rawSongData.length; i++) {
    if (rawSongData[i] != undefined) {
      songs = songs.concat(rawSongData[i]!.body.items);
    }
  }

  return songs;
}

async function fetchPlaylistGenres(tracks: SpotifyApi.PlaylistTrackObject[]) {
  // [
  //   ['23423423','9238478'],     <-- Track #1 (with 2 artist ids)
  //   ['9238478'],                <-- Track #2 (with 1 artist id)
  //   ...
  // ]
  let tracksArtistIds = getTrackArtistIds(tracks);

  let uniqueArtistsIds = tracksArtistIds
    .reduce((accumulator, value) => accumulator.concat(value), [])
    .filter((v, i, a) => a.indexOf(v) === i);

  let artistGenres: { artistId: string; genres: string[] }[] = [];

  let limit = 50;
  for (let i = 0; i < uniqueArtistsIds.length; i += limit) {
    let batchIds: string[] = uniqueArtistsIds.slice(i, i + limit);
    // ? Potential 429 status code fix, but not sure if it's needed.
    // ? https://github.com/thelinmichael/spotify-web-api-node/issues/217#issuecomment-870130885
    let response = await spotifyApi.getArtists(batchIds);
    for (let artist of response.body.artists) {
      artistGenres.push({ artistId: artist.id, genres: artist.genres });
    }
  }

  let tracksGenres: string[][] = [];
  let unclassifiedTracksAmount = 0;

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
    // If we push [] to tracksGenres, it means this track is unclassified.
    // We push it anyway to count percentages correctly later on (eg 98% hip hop and 2% unclassified).
    tracksGenres.push(trackGenres);

    if (trackGenres == []) {
      unclassifiedTracksAmount++;
    }
  }

  let unclassifiedTracksPercentage = Math.round(
    (unclassifiedTracksAmount / tracksGenres.length) * 100
  );

  return countGenresPercentage(
    tracksGenres,
    unclassifiedTracksAmount,
    unclassifiedTracksPercentage
  );
}

function countGenresPercentage(
  tracksGenres: string[][],
  unclassifiedAmount: number,
  unclassifiedPercentage: number
) {
  let genreAmounts: {
    genreName: string;
    count: number;
    percentage: number;
  }[] = [];

  for (let i = 0; i < tracksGenres.length; i++) {
    for (let j = 0; j < tracksGenres[i]!.length; j++) {
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
        // Since genres in trackGenres are unique per track, we can simply count them and divide by the total amount of tracks to calculate percentage.
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

  genreAmounts.push({
    genreName: 'unclassified',
    count: unclassifiedAmount,
    percentage: unclassifiedPercentage,
  });

  return genreAmounts;
}

function getTrackArtistIds(tracks: SpotifyApi.PlaylistTrackObject[]) {
  let tracksArtistIds: string[][] = [];

  // Iterate through each track
  for (let i = 0; i < tracks.length; i++) {
    let trackArtistIds: string[] = [];
    let track = tracks[i]!.track;
    if (track == null) {
      continue;
    }

    // Iterate through each artist of the track
    for (let j = 0; j < track.artists.length; j++) {
      let artist = track.artists[j]!;
      if (artist.name.length > 0 && artist.id != null) {
        trackArtistIds.push(artist.id);
      }
    }

    if (trackArtistIds.length > 0) {
      tracksArtistIds.push(trackArtistIds);
    }
  }

  return tracksArtistIds;
}
