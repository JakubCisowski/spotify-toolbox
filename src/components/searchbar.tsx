export default function Searchbar({
  playlistLink,
  onPlaylistLinkChange,
}: {
  playlistLink: string;
  onPlaylistLinkChange: (playlistLink: string) => void;
}) {
  return (
    <>
      <div>
        <form action="/playlist" method="get">
          <input
            type="text"
            name="link"
            placeholder="paste spotify playlist link here"
            value={playlistLink}
            onChange={(e) => onPlaylistLinkChange(e.target.value)}
            className="searchbar"
          />
          <div className="searchbar-button-wrapper">
            <input
              type="submit"
              value="analyze!"
              className="searchbar-button"
            />
          </div>
        </form>
      </div>
    </>
  );
}
