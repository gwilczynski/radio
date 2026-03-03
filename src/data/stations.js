import r357Logo from "../assets/357.webp";
import nsLogo from "../assets/ns.webp";
import kampusLogo from "../assets/kampus.webp";
import luzLogo from "../assets/luz.webp";
import jazzLogo from "../assets/jazz.jpg";
import rockLogo from "../assets/rock.webp";

export const stations = [
  {
    id: "357",
    name: "Radio 357",
    logoUrl: r357Logo,
    streamUrl: "https://stream.rcs.revma.com/ye5kghkgcm0uv",
  },
  {
    id: "ns",
    name: "Radio Nowy Świat",
    logoUrl: nsLogo,
    streamUrl: "https://stream.rcs.revma.com/ypqt40u0x1zuv",
  },
  {
    id: "kampus",
    name: "Radio Kampus",
    logoUrl: kampusLogo,
    streamUrl: "https://stream.radiokampus.fm/kampus",
  },
  {
    id: "luz",
    name: "Radio Luz",
    logoUrl: luzLogo,
    streamUrl: "https://stream.radioluz.pl:8443/luz_hifi.mp3",
  },
  {
    id: "jazz",
    name: "Radio JazzKultura",
    logoUrl: jazzLogo,
    streamUrl: "https://stream.radio.co/s1136b59f3/listen",
  },
  {
    id: "rock",
    name: "Radio RockSerwis",
    logoUrl: rockLogo,
    streamUrl: "https://stream9.nadaje.com:8003/live",
  },
];
