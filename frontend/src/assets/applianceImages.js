// Real Appliance Product Images Loader & Mapping
import acImg from './pngtree-summer-air-conditioning-refrigeration-evaporative-cooler-hvac-company-png-image_20720031 - Copy.png';
import fridgeImg from './modern-metal-stainless-steel-double-door-refrigerator-fridge-isolated-on-transparent-background-png.png';
import washingMachineImg from './washing-machine.jpg';
import microwaveImg from './pngtree-modern-microwave-oven-with-digital-display-png-image_20017348 - Copy.png';
import mixerGrinderImg from './mixer-grinder.png';
import pumpMotorImg from './Crompton_MB_MI_Series_Motorpumpkart_1 - Copy.png';
import airCoolerImg from './50721-9-evaporative-air-cooler-image-download-hq-png.png';
import inductionImg from './MAIN-2-webp-format - Copy.png';
import stabilizerImg from './air-conditioners-2-ton - Copy.png';
import pressIronImg from './Philips-GC102240-2000-W-Steam-Iron-1-1.png';
import tvImg from './HDMI-Ports-Image.png';
import ceilingFanImg from './1703162830_84ef7411554e47998d6a - Copy.png';
import geyserImg from './geyser-05 - Copy.png';
import standFanImg from './pngtree-big-stand-fan-png-image_6565463.png';
import tableFanImg from './hEJrguosxK4zQNlI.png';
import switchBoardImg from './electrical-switchboard-panel-syzwajgnusag22hs - Copy.png';

export const APPLIANCE_IMAGES_BY_ID = {
  1: acImg,              // AC Repair
  2: fridgeImg,          // Refrigerator
  3: washingMachineImg,  // Washing Machine
  4: microwaveImg,       // Microwave
  5: mixerGrinderImg,    // Mixer Grinder
  6: pumpMotorImg,       // Pump Motor
  7: airCoolerImg,       // Air Cooler
  8: inductionImg,       // Induction Cooktop
  9: stabilizerImg,      // Stabilizer
  10: pressIronImg,      // Press Iron
  11: tvImg,             // TV
  12: ceilingFanImg,     // Ceiling Fan
  13: geyserImg,         // Geyser
  14: standFanImg,       // Stand Fan
  15: tableFanImg,       // Table Fan
  16: switchBoardImg,    // Switch Board
};

/**
 * Returns the real product image URL matching an appliance ID or appliance name string.
 * Returns null if no match is found.
 */
export function getApplianceImage(id = null, name = '') {
  const numId = Number(id);
  if (numId && APPLIANCE_IMAGES_BY_ID[numId]) {
    return APPLIANCE_IMAGES_BY_ID[numId];
  }

  const str = String(name || '').toLowerCase().trim();
  if (!str) return null;

  if (/\b(ac|air conditioner|air conditioning)\b/i.test(str)) return APPLIANCE_IMAGES_BY_ID[1];
  if (/refrigerator|fridge/i.test(str)) return APPLIANCE_IMAGES_BY_ID[2];
  if (/washing/i.test(str)) return APPLIANCE_IMAGES_BY_ID[3];
  if (/microwave|oven/i.test(str)) return APPLIANCE_IMAGES_BY_ID[4];
  if (/mixer|grinder|mixi/i.test(str)) return APPLIANCE_IMAGES_BY_ID[5];
  if (/pump|motor/i.test(str)) return APPLIANCE_IMAGES_BY_ID[6];
  if (/cooler/i.test(str)) return APPLIANCE_IMAGES_BY_ID[7];
  if (/induction|cooktop/i.test(str)) return APPLIANCE_IMAGES_BY_ID[8];
  if (/stabilizer/i.test(str)) return APPLIANCE_IMAGES_BY_ID[9];
  if (/iron|press/i.test(str)) return APPLIANCE_IMAGES_BY_ID[10];
  if (/\btv\b|television/i.test(str)) return APPLIANCE_IMAGES_BY_ID[11];
  if (/ceiling/i.test(str)) return APPLIANCE_IMAGES_BY_ID[12];
  if (/geyser|water heater/i.test(str)) return APPLIANCE_IMAGES_BY_ID[13];
  if (/stand fan/i.test(str)) return APPLIANCE_IMAGES_BY_ID[14];
  if (/table fan|wall fan/i.test(str)) return APPLIANCE_IMAGES_BY_ID[15];
  if (/fan/i.test(str)) return APPLIANCE_IMAGES_BY_ID[12];
  if (/switch|board|wiring|electrical/i.test(str)) return APPLIANCE_IMAGES_BY_ID[16];

  return null;
}

export {
  acImg,
  fridgeImg,
  washingMachineImg,
  microwaveImg,
  mixerGrinderImg,
  pumpMotorImg,
  airCoolerImg,
  inductionImg,
  stabilizerImg,
  pressIronImg,
  tvImg,
  ceilingFanImg,
  geyserImg,
  standFanImg,
  tableFanImg,
  switchBoardImg,
};
