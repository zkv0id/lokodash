import type {
  Dataset,
  Depo,
  Lokomotif,
  LokomotifStatus,
  WheelMeasurement,
  WheelSide,
} from "./domain";
import { AXLES, SIDES } from "./domain";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEPO_DEFS: Omit<Depo, "id">[] = [
  {
    code: "KDR",
    name: "Depo Lokomotif Kampung Durian Runtuh",
    region: "Divisi Regional IV",
  },
  {
    code: "SMG",
    name: "Depo Induk Semarang Poncol",
    region: "Jawa Tengah",
  },
  { code: "CN", name: "Depo Cirebon", region: "Jawa Barat" },
  { code: "SBI", name: "Depo Surabaya Pasar Turi", region: "Jawa Timur" },
];

const MONTHS = [
  "2026-01-15",
  "2026-02-15",
  "2026-03-15",
  "2026-04-15",
  "2026-05-15",
  "2026-06-15",
  "2026-07-15",
  "2026-08-15",
  "2026-09-15",
  "2026-10-15",
];

const LOCO_COUNT = 15;

const LOCO_STATUS: LokomotifStatus[] = ["aktif", "aktif", "perawatan"];

const INVALID_DIAMETER_WHEELS = new Set([17, 71, 133]);
const INVALID_HEIGHT_WHEEL = 89;
const WARNING_HEIGHT_WHEEL = 97;

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function buildDemoDataset(): Dataset {
  const depos: Depo[] = DEPO_DEFS.map((d, index) => ({
    id: index + 1,
    ...d,
  }));

  const lokomotifs: Lokomotif[] = [];
  const measurements: WheelMeasurement[] = [];
  let measurementId = 1;
  let wheelIndex = 0;

  for (let locoIndex = 0; locoIndex < LOCO_COUNT; locoIndex += 1) {
    const rand = mulberry32(9001 + locoIndex * 137);
    const depoId =
      locoIndex < 12
        ? 1
        : 2 + ((locoIndex - 12) % (depos.length - 1));
    const nomor = `CC205 ${String(locoIndex + 1).padStart(2, "0")}`;
    const totalKm = Math.round(180000 + locoIndex * 24000 + rand() * 90000);

    lokomotifs.push({
      id: locoIndex + 1,
      nomor,
      depoId,
      status: LOCO_STATUS[locoIndex % LOCO_STATUS.length],
      totalKm,
    });

    for (const axle of AXLES) {
      for (const side of SIDES) {
        const currentWheel = wheelIndex;
        wheelIndex += 1;

        const urgentDiameter = currentWheel % 26 === 0;
        const warningDiameter = currentWheel % 34 === 9;
        const urgentFlange = currentWheel % 25 === 4;
        const warningFlange =
          !urgentFlange && currentWheel % 3 === 0;
        const warningHeight = currentWheel === WARNING_HEIGHT_WHEEL;
        const invalidDiameter = INVALID_DIAMETER_WHEELS.has(currentWheel);
        const invalidHeight = currentWheel === INVALID_HEIGHT_WHEEL;

        const diameterStart = urgentDiameter
          ? 1005 + rand() * 5
          : warningDiameter
            ? 1024 + rand() * 5
            : 1036 + rand() * 26;
        const diameterRate = urgentDiameter
          ? 1.6 + rand() * 0.3
          : warningDiameter
            ? 1.3 + rand() * 0.3
            : 0.7 + rand() * 0.5;

        const flangeStart = urgentFlange
          ? 26.6 + rand() * 0.6
          : warningFlange
            ? 28.2 + rand() * 0.8
            : 28.8 + rand() * 2;
        const flangeRate = urgentFlange
          ? 0.5 + rand() * 0.08
          : warningFlange
            ? 0.35 + rand() * 0.05
            : 0.18 + rand() * 0.1;

        const heightStart = warningHeight ? 30.4 : 28 + rand() * 0.9;
        const heightRate = warningHeight ? 0.18 : 0.03 + rand() * 0.06;

        const treadStart = 1 + rand() * 1.2;
        const treadRate = 0.1 + rand() * 0.15;
        const gaugeStart = 998.5 + rand() * 3;
        const gaugeDrift = (rand() - 0.5) * 0.35;
        const kmStart = totalKm - 160000 + rand() * 30000;
        const kmStep = 15000 + rand() * 6000;

        MONTHS.forEach((measuredAt, monthIndex) => {
          const step = monthIndex;
          let diameter = diameterStart - diameterRate * step;
          let flangeHeight = heightStart + heightRate * step;

          if (monthIndex === MONTHS.length - 1) {
            if (invalidDiameter) diameter = 1090;
            if (invalidHeight) flangeHeight = 45;
          }

          measurements.push({
            id: measurementId,
            lokomotifId: locoIndex + 1,
            axle,
            side: side as WheelSide,
            measuredAt,
            km: Math.round(kmStart + kmStep * step),
            diameterMm: round(diameter),
            flangeThicknessMm: round(flangeStart - flangeRate * step),
            flangeHeightMm: round(flangeHeight),
            treadWearMm: round(treadStart + treadRate * step),
            gaugeMm: round(gaugeStart + gaugeDrift * step),
            note: null,
          });
          measurementId += 1;
        });
      }
    }
  }

  return { depos, lokomotifs, measurements };
}

export const demoDataset = buildDemoDataset();
