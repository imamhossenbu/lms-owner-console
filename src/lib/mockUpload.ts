/** Mock upload (no backend yet): returns a hosted-looking URL after a short delay. */
export async function mockUploadFile(file: File): Promise<{ url: string }> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  return { url: `https://res.cloudinary.com/demo/raw/upload/${Date.now().toString(36)}-${safeName}` };
}
