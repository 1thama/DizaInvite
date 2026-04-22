export const getGoogleMapsLink = (locationName: string, customLink?: string) => {
  if (customLink && customLink.trim() !== '') {
    return customLink;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
};
