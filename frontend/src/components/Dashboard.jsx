import { useAuth0 } from '@auth0/auth0-react';
import './Dashboard.css';

const SAVED_PLACES = [
  { name: 'Quiet Corner Library', meta: '0.8 km • Dim lighting • Free charging', score: 9.3, tier: 'high' },
  { name: 'Fern Courtyard Café', meta: '1.4 km • Soft daylight • Quiet zone', score: 8.1, tier: 'medium' },
  { name: 'Willow Park', meta: '1.1 km • Open space • Lower crowding', score: 9.1, tier: 'high' },
];

const SENSORY_SLIDERS = [
  { label: 'Noise tolerance', tag: 'Quiet preferred', percent: 28, min: 'Quiet', max: 'Busy' },
  { label: 'Lighting sensitivity', tag: 'Moderate', percent: 52, min: 'Dim', max: 'Bright' },
  { label: 'Crowd tolerance', tag: 'Lower density', percent: 32, min: 'Calm', max: 'Crowded' },
];

function Dashboard() {
  const { user } = useAuth0();
  const userName = user?.given_name || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="dash">
      {/* ── Center Column ── */}
      <div className="dash-center">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-search">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8.25" cy="8.25" r="4.5" stroke="#6b7280" strokeWidth="1.5"/>
              <path d="M15.75 15.75L11.5 11.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search a place or tag" readOnly />
          </div>
          <div className="dash-header-actions">
            <button className="dash-btn-outline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8.67 3.33L14 8l-5.33 4.67" stroke="#0f1720" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Calm route
            </button>
            <button className="dash-btn-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M4 6l4-4 4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit profile
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="dash-scroll">
          {/* Welcome + Best Match */}
          <div className="dash-welcome">
            <div className="dash-welcome-left">
              <span className="dash-overview-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.25" stroke="#0f1720" strokeWidth="1.2"/>
                  <path d="M7 4v3l2.25 1.25" stroke="#0f1720" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Today's overview
              </span>
              <h2>Welcome back, {userName}.</h2>
              <p className="dash-welcome-desc">
                Your dashboard is focused on the few things you need most today: your profile, trusted places, and nearby matches.
              </p>
              <div className="dash-env-stats">
                <div className="dash-env-stat">
                  <div className="dash-env-stat-label">Noise</div>
                  <div className="dash-env-stat-value">Low</div>
                </div>
                <div className="dash-env-stat">
                  <div className="dash-env-stat-label">Lighting</div>
                  <div className="dash-env-stat-value">Medium</div>
                </div>
                <div className="dash-env-stat">
                  <div className="dash-env-stat-label">Crowds</div>
                  <div className="dash-env-stat-value">Low</div>
                </div>
              </div>
            </div>

            <div className="dash-match-card">
              <div>
                <h3 className="dash-match-title">Best nearby match</h3>
                <p className="dash-match-desc">
                  Harbor Reading Room matches your settings well this morning.
                </p>
              </div>
              <div>
                <div className="dash-match-score-row">
                  <span className="dash-match-score-label">Match score</span>
                  <span className="dash-match-score-val">92%</span>
                </div>
                <div className="dash-match-bar" style={{ marginTop: 8 }}>
                  <div className="dash-match-bar-fill" style={{ width: '92%' }} />
                </div>
              </div>
              <span className="dash-match-status">Quiet now • 0.9 km away</span>
            </div>
          </div>

          {/* Sensory Profile + Saved Places */}
          <div className="dash-bottom-row">
            {/* Sensory Profile */}
            <div className="dash-section">
              <div>
                <h3 className="dash-section-title">Sensory profile</h3>
                <p className="dash-section-desc">Only the main preferences are shown here for easier scanning.</p>
              </div>

              <div className="dash-sliders">
                {SENSORY_SLIDERS.map((s) => (
                  <div className="dash-slider-group" key={s.label}>
                    <div className="dash-slider-header">
                      <span className="dash-slider-label">{s.label}</span>
                      <span className="dash-slider-tag">{s.tag}</span>
                    </div>
                    <div className="dash-slider-track">
                      <div className="dash-slider-fill" style={{ width: `${s.percent}%` }} />
                      <div className="dash-slider-thumb" style={{ left: `${s.percent}%` }} />
                    </div>
                    <div className="dash-slider-labels">
                      <span className="dash-slider-min">{s.min}</span>
                      <span className="dash-slider-max">{s.max}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dash-preview">
                <h4 className="dash-preview-title">Preview</h4>
                <p className="dash-preview-text">
                  Recommendations will continue to favor quiet indoor spaces before noon.
                </p>
              </div>
            </div>

            {/* Saved Places */}
            <div className="dash-section">
              <div className="dash-saved-header">
                <div className="dash-saved-header-text">
                  <h3>Saved places</h3>
                  <p>A short list of trusted locations.</p>
                </div>
                <button className="dash-view-all">View all</button>
              </div>

              <div className="dash-places-list">
                {SAVED_PLACES.map((place) => (
                  <div className="dash-place-item" key={place.name}>
                    <div>
                      <div className="dash-place-name">{place.name}</div>
                      <div className="dash-place-meta">{place.meta}</div>
                    </div>
                    <span className={`dash-place-score ${place.tier}`}>{place.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="dash-right">
        {/* AI Insight */}
        <div className="dash-right-card">
          <div>
            <h3 className="dash-right-title">AI insight</h3>
            <p className="dash-right-desc">A single, easy-to-read summary for your selected place.</p>
          </div>

          <div className="dash-confidence-row">
            <span className="dash-confidence-badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.25" stroke="#0f1720" strokeWidth="1.2"/>
                <path d="M5.25 7h3.5M7 5.25v3.5" stroke="#0f1720" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Confidence
            </span>
            <span className="dash-confidence-val">85%</span>
          </div>

          <div className="dash-confidence-bar">
            <div className="dash-confidence-bar-fill" style={{ width: '85%' }} />
          </div>

          <div className="dash-factors-card">
            <div className="dash-factors-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 8a5.5 5.5 0 0111 0" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M5.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="dash-factors-text">
              <h4>Likely sensory factors</h4>
              <p>Light street noise, bright rear lighting, and busier evenings.</p>
            </div>
          </div>
        </div>

        {/* Before you go */}
        <div className="dash-right-card">
          <div>
            <h3 className="dash-right-title">Before you go</h3>
            <p className="dash-right-desc">Simple preparation guidance.</p>
          </div>

          <div className="dash-tips-list">
            <div className="dash-tip-item">
              <div className="dash-tip-title">Best time</div>
              <div className="dash-tip-text">Before noon is the calmest</div>
            </div>
            <div className="dash-tip-item">
              <div className="dash-tip-title">Helpful tip</div>
              <div className="dash-tip-text">Choose seating near the window</div>
            </div>
          </div>
        </div>

        {/* Soft alert */}
        <div className="dash-right-card">
          <div>
            <h3 className="dash-right-title">Soft alert</h3>
            <p className="dash-right-desc">Only shown when there may be a concern.</p>
          </div>

          <div className="dash-alert-box">
            <h4 className="dash-alert-title">Possible triggers later today</h4>
            <p className="dash-alert-text">
              Dense crowds and brighter lighting may increase after 5pm.
            </p>
            <span className="dash-alert-action">Plan for an earlier visit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
