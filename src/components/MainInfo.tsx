// import './MainInfo.css';

export default function MainInfo() {
  return (
    <div className="main-info">
      <h1>
        XIV
        <br /> TT <span id="now">W</span>
      </h1>
      <p id="info">
        Not just a <span>BRAND</span> we are the <span>FUTURE</span>
      </p>
      <div style={{ marginTop: '30px', display: 'flex' }}>
        <a href="#">Shop Now</a>
        {/* <a href="#">Docs</a> */}
      </div>
    </div>
  );
}
