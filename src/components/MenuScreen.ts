import "./MenuScreen.css";
import { createButton } from "./Button";
import { createModal, type Modal } from "./Modal";

export interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
  onShowRankings: () => void;
  onExit: () => void;
}

export interface MenuScreen {
  el: HTMLElement;
  update: (props: MenuScreenProps) => void;
  destroy: () => void;
}

export function createMenuScreen(props: MenuScreenProps): MenuScreen {
  const el = document.createElement("div");
  el.className = "menu-screen";

  let modal: Modal | null = null;

  const title = document.createElement("h1");
  title.className = "menu-screen__title";
  title.textContent = "WAVEFRAME";

  const instructions = document.createElement("p");
  instructions.className = "menu-screen__instructions";
  instructions.textContent =
    "Make hand gestures to match the target. Do that with your fingers facing the camera, though, 'cause idk how to make it register backhands XD";

  const controls = document.createElement("div");
  controls.className = "menu-screen__controls";

  const startButton = createButton({
    text: "Start Game",
    onClick: props.onStart,
  });

  const hint = document.createElement("p");
  hint.style.color = "var(--text-secondary)";
  hint.style.fontSize = "14px";
  hint.textContent = "Press Space to start";

  controls.appendChild(startButton.el);
  controls.appendChild(hint);

  el.appendChild(title);
  el.appendChild(instructions);
  el.appendChild(controls);

  // Make corner badges clickable
  const rankingsBadge = document.createElement("div");
  rankingsBadge.className = "menu-screen__badge menu-screen__badge--rankings";
  rankingsBadge.textContent = "RANKINGS";
  rankingsBadge.onclick = props.onShowRankings;

  const exitBadge = document.createElement("div");
  exitBadge.className = "menu-screen__badge menu-screen__badge--exit";
  exitBadge.textContent = "EXIT";
  exitBadge.onclick = props.onExit;

  el.appendChild(rankingsBadge);
  el.appendChild(exitBadge);

  // Footer with legal links
  const footer = document.createElement("div");
  footer.className = "menu-screen__footer";

  const termsLink = document.createElement("a");
  termsLink.className = "menu-screen__link";
  termsLink.textContent = "Terms";
  termsLink.href = "#";
  termsLink.onclick = (e) => {
    e.preventDefault();
    showTermsModal();
  };

  const sep = document.createElement("span");
  sep.className = "menu-screen__separator";
  sep.textContent = "•";

  const privacyLink = document.createElement("a");
  privacyLink.className = "menu-screen__link";
  privacyLink.textContent = "Privacy";
  privacyLink.href = "#";
  privacyLink.onclick = (e) => {
    e.preventDefault();
    showPrivacyModal();
  };

  footer.appendChild(termsLink);
  footer.appendChild(sep);
  footer.appendChild(privacyLink);

  el.appendChild(footer);

  function showPrivacyModal() {
    if (modal) {
      modal.destroy();
      el.removeChild(modal.el);
    }
    modal = createModal({
      title: "Privacy Policy",
      content: getPrivacyContent(),
      onClose: () => {
        if (modal) {
          modal.destroy();
          el.removeChild(modal.el);
          modal = null;
        }
      },
    });
    el.appendChild(modal.el);
  }

  function showTermsModal() {
    if (modal) {
      modal.destroy();
      el.removeChild(modal.el);
    }
    modal = createModal({
      title: "Terms of Service",
      content: getTermsContent(),
      onClose: () => {
        if (modal) {
          modal.destroy();
          el.removeChild(modal.el);
          modal = null;
        }
      },
    });
    el.appendChild(modal.el);
  }

  return {
    el,
    update(nextProps: MenuScreenProps) {
      props = nextProps;
    },
    destroy() {
      startButton.destroy();
      if (modal) {
        modal.destroy();
      }
    },
  };
}

function getPrivacyContent(): string {
  return `
    <p><strong>Last Updated: October 1, 2026</strong></p>
    <p>Waveframe is a free open-source hobby project. This Privacy Policy explains what information the Waveframe application does and does not intentionally collect.</p>
    
    <h2>1. Information We Collect</h2>
    <p><strong>Waveframe does not intentionally collect or store personal information through the game.</strong></p>
    <p>You do not need to create an account or provide an email address, real name, or other personal information to play.</p>
    
    <h2>2. Camera Data</h2>
    <p>Waveframe uses your device's camera for hand tracking and gesture recognition.</p>
    <p>When you grant camera permission:</p>
    <ul>
      <li>Camera frames are processed locally in your browser.</li>
      <li>Waveframe does not intentionally upload camera frames to its servers.</li>
      <li>Camera frames are not intentionally recorded or stored by Waveframe.</li>
      <li>Camera access is used only for the game's hand-tracking functionality.</li>
      <li>Camera access ends when the game no longer has permission to use your camera.</li>
    </ul>
    
    <h2>3. Local Game Data</h2>
    <p>Waveframe may store gameplay information in your browser's local storage, including:</p>
    <ul>
      <li>Optional player name</li>
      <li>Game scores</li>
      <li>High scores</li>
      <li>Streak records</li>
      <li>Timestamps associated with game records</li>
    </ul>
    <p>This information is stored locally by your browser and is not intentionally transmitted to Waveframe.</p>
    
    <h2>4. Analytics and Tracking</h2>
    <p>Waveframe does not intentionally use analytics services, advertising trackers, tracking pixels, or cookies for user tracking.</p>
    
    <h2>5. Third-Party Services</h2>
    <p>Waveframe uses <strong>MediaPipe</strong> by Google for hand tracking and gesture recognition. This library runs entirely in your browser and processes camera data locally on your device.</p>
    <p>The hosted version is provided through Vercel, which may process technical information such as IP addresses.</p>
    
    <h2>6. Data Deletion</h2>
    <p>Because gameplay data is stored locally in your browser, you can delete it at any time by clearing the game's local storage or browser site data.</p>
    
    <p><strong>In short:</strong> Waveframe is designed to process gameplay and camera input locally in your browser. It does not intentionally collect or store your camera feed or personal information.</p>
  `;
}

function getTermsContent(): string {
  return `
    <p>By using Waveframe, you agree to these Terms of Service.</p>
    <p>Waveframe is a free open-source gesture game made as a hobby project, provided free of charge for entertainment, experimentation, and educational purposes. The game may be changed, interrupted, or discontinued at any time without notice.</p>
    
    <h2>1. The Service</h2>
    <p>Waveframe is provided free of charge for entertainment, experimentation, and educational purposes. The game may be changed, interrupted, or discontinued at any time without notice.</p>
    
    <h2>2. Use of the Game</h2>
    <p>You may:</p>
    <ul>
      <li>Play Waveframe for personal, educational, or recreational purposes.</li>
      <li>Share the game with others.</li>
      <li>Use and modify the source code in accordance with the MIT License.</li>
    </ul>
    <p>You must not use Waveframe for unlawful purposes or in ways that violate applicable laws or the rights of others.</p>
    
    <h2>3. Disclaimer</h2>
    <p>Waveframe is provided <strong>"as is" and "as available," without warranties of any kind</strong>, to the maximum extent permitted by applicable law.</p>
    <p>The game may contain bugs, compatibility issues, inaccurate gesture detection, or other unexpected behavior. Use of the game is at your own discretion and risk.</p>
    
    <h2>4. Camera Usage</h2>
    <p>Waveframe requires camera access for its hand-tracking gameplay.</p>
    <p>When camera access is enabled:</p>
    <ul>
      <li>Camera frames are processed locally in your browser for gameplay.</li>
      <li>Waveframe does not intentionally upload, record, or store your camera feed.</li>
      <li>Camera access is used for hand tracking and gesture recognition.</li>
      <li>You can revoke camera permission through your browser at any time.</li>
    </ul>
    
    <h2>5. Local Leaderboard</h2>
    <p>Waveframe's leaderboard is stored locally in your browser. If you enter a player name, it is stored in your browser's local storage. You are responsible for the names you choose to use.</p>
    
    <h2>6. Intellectual Property</h2>
    <p>The Waveframe source code is released under the MIT License. Waveframe may also contain third-party software, libraries, or assets that are subject to their own licenses.</p>
    
    <h2>7. Limitation of Liability</h2>
    <p>To the maximum extent permitted by applicable law, the authors and copyright holders of Waveframe shall not be liable for indirect, incidental, special, consequential, or other damages arising from or related to your use of, or inability to use, the game.</p>
    
    <h2>8. Changes and Availability</h2>
    <p>Waveframe may be updated, modified, suspended, or discontinued at any time. These Terms may also be updated from time to time.</p>
    
    <p><strong>In short:</strong> Waveframe is a free hobby project. Have fun, don't do anything illegal with it, and remember that it's provided as-is.</p>
  `;
}
