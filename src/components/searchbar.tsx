import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Searchbar() {
  const [playlistLink, setPlaylistLink] = useState('');
  const router = useRouter();

  const showError = () =>
    toast.error('Invalid playlist link!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (playlistLink.length != 76) {
      showError();
      return;
    }

    router.push(`/playlist?link=${playlistLink}`);
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
      />

      <div>
        <form onSubmit={handleSubmit} method="get">
          <input
            type="text"
            name="link"
            placeholder="paste spotify playlist link here"
            value={playlistLink}
            onChange={(e) => setPlaylistLink(e.target.value)}
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
