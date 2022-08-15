import Link from 'next/link';

export default function Logo() {
  return (
    <>
      <Link href="/">
        <a>
          <div className="logo-text">
            <span className="green-text">spotify</span> toolbox
          </div>
          <br></br>
          <div className="logo-subtext">• find playlist genre •</div>
        </a>
      </Link>
    </>
  );
}
