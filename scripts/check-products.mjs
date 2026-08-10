const res = await fetch('https://website.axontech254.workers.dev/api/products');
const text = await res.text();
try {
  const data = JSON.parse(text);
  console.log('count:', data.length);
  console.log('spec:', JSON.stringify(data[0]?.specifications));
  console.log('variants:', JSON.stringify(data[0]?.variants));
} catch (e) {
  console.error('JSON error:', e.message);
}
