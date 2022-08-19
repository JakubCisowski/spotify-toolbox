import SpotifyWebApi from 'spotify-web-api-node';

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function authorize() {
  const authorizationResponse = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(authorizationResponse.body.access_token);
}

async function getAllSongs(id: string) {
  var data = await spotifyApi.getPlaylistTracks(id);
  var numBatches = Math.floor(data.body.total / 100) + 1;
  var promises = [];
  for (let batchNum = 0; batchNum < numBatches; batchNum++) {
    var promise = getSongs(id, batchNum * 100);
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

async function getSongs(id: string, offset: number) {
  var songs = await spotifyApi.getPlaylistTracks(id, { offset: offset });
  return songs;
}

export default async function fetchPlaylistInfoAsync(playlistId: string) {
  await authorize();
  let playlistBody = (await spotifyApi.getPlaylist(playlistId)).body;

  let playlistAllTracks = await getAllSongs(playlistId); // ! działa

  console.log(
    '0.5. getAllSongs() returns that many tracks: ' + playlistAllTracks.length
  );

  let playlistInfo = {
    name: playlistBody.name,
    imageUrl: playlistBody.images[0]!.url,
    genres: await getPlaylistGenresAsync(playlistAllTracks),
  };

  return playlistInfo;
}

async function getPlaylistGenresAsync(
  tracks: SpotifyApi.PlaylistTrackObject[]
) {
  var tracksArtistIds: string[][] = [];
  let artistsIdsUnique: string[] = []; // ? for genre finding optimalziation

  for (var i = 0; i < tracks.length; i++) {
    // Each track
    var ids: string[] = [];
    var track = tracks[i]!.track;
    if (track == null) {
      continue;
    }
    for (var j = 0; j < track.artists.length; j++) {
      // Each artist in track
      if (track.artists[j]!.name.length > 0 && track.artists[j]!.id != null) {
        ids.push(track.artists[j]!.id);
      }

      if (!artistsIdsUnique.includes(track.artists[j]!.id)) {
        artistsIdsUnique.push(track.artists[j]!.id);
      }
    }
    if (ids.length > 0) {
      tracksArtistIds.push(ids);
    }
  }

  let artistGenres: { artistId: string; genres: string[] }[] = [];

  for (let artistId of artistsIdsUnique) {
    await spotifyApi
      .getArtist(artistId)
      .then(function (data) {
        artistGenres.push({ artistId: artistId, genres: data.body.genres });
      })
      .catch((err) => console.log(err));
  }

  let tracksWithGenres: string[][] = [];

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
    tracksWithGenres.push(trackGenres);
  }

  // todo
  // https://github.com/thelinmichael/spotify-web-api-node/issues/217#issuecomment-870130885
  // Tutaj trzeba dodać takie coś do catcha tylko, że tam jest TypeScript
  // Wyskakuje err 429, bo za duzo requestow i musimy wkorzystac retry after z settimeoutem. (moze wystarczy tylko jedna proba wiec uproszczone)

  // todo cleanup to wszystko

  var genreCountsArray: {
    genreName: string;
    count: number;
    percentage: number;
  }[] = [];

  for (var i = 0; i < tracksWithGenres.length; i++) {
    for (var j = 0; j < tracksWithGenres[i]!.length; j++) {
      let genreObjectOldArray = tracksWithGenres[i]![j];
      let genreObjectNewArray = genreCountsArray.find(
        (x) => x.genreName === genreObjectOldArray
      );

      if (genreObjectNewArray === undefined) {
        genreCountsArray.push({
          genreName: genreObjectOldArray!,
          count: 1,
          percentage: 0,
        });
      } else {
        genreObjectNewArray.count++;
      }
    }
  }

  // Calculate percentage of each genre
  genreCountsArray = genreCountsArray.map((x) => {
    x.percentage = Math.round((x.count / tracksWithGenres.length) * 100);
    return x;
  });

  // Sort by percentage and then by genre name length
  genreCountsArray.sort((a, b) => b.percentage - a.percentage);

  // Add unclassified tracks info;
  // todo: Maybe pass this info separately
  var unclassifiedTracks = 0;
  for (var i = 0; i < tracksWithGenres.length; i++) {
    if (tracksWithGenres[i]!.length == 0) {
      unclassifiedTracks++;
    }
  }
  var unclassifiedTracksPercentage = Math.round(
    (unclassifiedTracks / tracksWithGenres.length) * 100
  );

  genreCountsArray.push({
    genreName: 'unclassified',
    count: unclassifiedTracks,
    percentage: unclassifiedTracksPercentage,
  });

  console.log(
    '3. getPlaylistGenresAsync() returns that many tracks: ' +
      tracksWithGenres.length
  );

  return genreCountsArray;
}

export {};
