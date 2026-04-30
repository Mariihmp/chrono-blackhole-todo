// 50 different planet color schemes and patterns
export const planetStyles = Array.from({ length: 50 }, (_, i) => {
  const hue = (i * 137.5) % 360; // golden angle for variety
  const sat = 50 + (i % 50);
  const light = 45 + (i % 20);
  const secondHue = (hue + 80) % 360;
  
  return {
    gradient: `radial-gradient(circle at 30% 30%, hsl(${hue}, ${sat}%, ${light}%), hsl(${secondHue}, ${sat - 10}%, ${light - 15}%))`,
    ring: (i % 7 === 0), // some have rings
    atmosphere: `rgba(${100 + (i % 155)}, ${50 + (i % 100)}, ${150 + (i % 105)}, 0.3)`,
    pattern: i % 5, // 0: solid, 1: stripes, 2: spots, 3: swirl, 4: cratered
  };
});

export function getPlanetStyle(planetType) {
  return planetStyles[planetType % 50];
}