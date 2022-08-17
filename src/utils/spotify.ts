import SpotifyWebApi from 'spotify-web-api-node';

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function authorize() {
  const authorizationResponse = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(authorizationResponse.body.access_token);
}

export default async function fetchPlaylistInfoAsync(playlistId: string) {
  await authorize();
  let dataBody = (await spotifyApi.getPlaylist(playlistId)).body;
  let tracksWithArtists = getTrackArtists(dataBody);
  let playlistInfo = {
    name: dataBody.name,
    imageUrl: dataBody.images[0]!.url,
    genres: await getPlaylistGenresAsync(tracksWithArtists),
  };

  return playlistInfo;
}

function getTrackArtists(playlistData: SpotifyApi.SinglePlaylistResponse) {
  var tracksWithArtists: string[][] = [];
  var tracks = playlistData.tracks;
  for (var i = 0; i < tracks.items.length; i++) {
    // Each track
    var trackWithArtists: string[] = [];
    var track = tracks.items[i]!.track;
    if (track == null) {
      continue;
    }
    for (var j = 0; j < track.artists.length; j++) {
      // Each artist in track
      if (track.artists[j]!.name.length > 0 && track.artists[j]!.id != null) {
        trackWithArtists.push(track.artists[j]!.id);
      }
    }
    if (trackWithArtists.length > 0) {
      tracksWithArtists.push(trackWithArtists);
    }
  }
  return tracksWithArtists;
}

async function getPlaylistGenresAsync(tracksWithArtists: string[][]) {
  var tracksWithGenres: string[][] = [];

  for (let trackObject of tracksWithArtists) {
    var trackWithGenre: string[] = [];

    // todo
    // https://github.com/thelinmichael/spotify-web-api-node/issues/217#issuecomment-870130885
    // Tutaj trzeba dodać takie coś do catcha tylko, że tam jest TypeScript
    // Wyskakuje err 429, bo za duzo requestow i musimy wkorzystac retry after z settimeoutem. (moze wystarczy tylko jedna proba wiec uproszczone)
    for (let trackArtistId of trackObject) {
      await spotifyApi
        .getArtist(trackArtistId)
        .then(function (data) {
          for (var genre of data.body.genres) {
            trackWithGenre.push(genre);
          }
        })
        .catch((err) => console.log(err));
    }

    let trackWithDistinctGenres = trackWithGenre.filter(function (item, pos) {
      return trackWithGenre.indexOf(item) == pos;
    });

    tracksWithGenres.push(trackWithDistinctGenres);
  }

  // Take tracksWithGenres and create an array of genres and amount of times they appear
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

  return genreCountsArray;
}

export {};
