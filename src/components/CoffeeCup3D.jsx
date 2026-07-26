import './CoffeeCup3D.css';

export default function CoffeeCup3D() {
  return (
    <div className="coffee-scene" aria-hidden="true">
      <div className="saucer-shadow" />
      <div className="saucer">
        <div className="saucer-rim" />
      </div>
      <div className="cup-wrap">
        <div className="cup">
          <div className="cup-body">
            <div className="cup-inner">
              <div className="coffee-surface">
                <div className="coffee-crema" />
                <div className="coffee-ring r1" />
                <div className="coffee-ring r2" />
              </div>
            </div>
            <div className="cup-shine" />
            <div className="cup-base-shadow" />
          </div>
          <div className="cup-handle" />
        </div>
      </div>
      <div className="steam-group">
        <div className="steam s1" />
        <div className="steam s2" />
        <div className="steam s3" />
        <div className="steam s4" />
        <div className="steam s5" />
      </div>
    </div>
  );
}
