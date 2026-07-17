export default function Emblem({ size = 180 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Motor Pool service and supply emblem">
      <circle cx="100" cy="100" r="96" fill="#3d5c3a" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="#d9b44a" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="58" fill="#f4eedd" />
      <defs>
        <path id="emblem-ring" d="M 100,100 m -68,0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0" />
      </defs>
      <text style={{ fontFamily: "'Courier New', monospace", fontSize: '12.5px', letterSpacing: '3px', fontWeight: 700 }} fill="#f4eedd">
        <textPath href="#emblem-ring" startOffset="2%">MOTOR POOL · SERVICE &amp; SUPPLY · EST 1944 ·</textPath>
      </text>
      <text x="100" y="88" textAnchor="middle" style={{ fontSize: '30px' }} fill="#3d5c3a">★</text>
      <text x="100" y="118" textAnchor="middle" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.5px' }} fill="#26251f">motor pool</text>
      <text x="100" y="134" textAnchor="middle" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '8px', fontWeight: 700, letterSpacing: '1.5px' }} fill="#5c5f44">KNOWLEDGE DEPOT</text>
    </svg>
  );
}
