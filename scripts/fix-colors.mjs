import { readFileSync, writeFileSync } from "fs";

let c = readFileSync("src/components/AdminView.tsx", "utf8");

// Find the insertion point
const idx = c.indexOf("No color swatch images assigned yet");
if (idx === -1) {
  console.error("Marker not found!");
  process.exit(1);
}

// Find the closing div before "Add new color swatch"
const afterText = c.substring(idx);
const closeDivIdx = afterText.indexOf("</div>");
const addSwatchIdx = afterText.indexOf("{/* Add new color swatch */}");

// We want to insert after the div that closes the "No color swatch" section
// Find the pattern: </div>\r\n                      )}\r\n\r\n  \n                      {/* Add new color swatch */}
const fullMarker = "No color swatch images assigned yet.\r\n                        </div>\r\n                      )}\r\n\r\n                      {/* Add new color swatch */}";
const markerIdx = c.indexOf(fullMarker);
if (markerIdx === -1) {
  console.error("Full marker not found!");
  console.log("Looking for:", JSON.stringify(fullMarker.substring(0, 100)));
  process.exit(1);
}

const newSection = `No color swatch images assigned yet.
                        </div>
                      )}

                      {/* Color Codes — hex values per color name */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase block">Color Codes (Hex)</span>
                        {Object.keys(editingProduct?.colorCodes || {}).length > 0 ? (
                          <div className="border border-outline/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-[11px] border-collapse">
                              <thead>
                                <tr className="bg-surface border-b border-outline/10 text-on-surface-variant/80 font-bold">
                                  <th className="p-2">Color</th>
                                  <th className="p-2">Hex Code</th>
                                  <th className="p-2">Preview</th>
                                  <th className="p-2 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline/10 font-medium">
                                {Object.entries(editingProduct?.colorCodes || {}).map(([color, hex]) => (
                                  <tr key={color} className="hover:bg-surface-container-high/30">
                                    <td className="p-2 font-bold">{color}</td>
                                    <td className="p-2 font-mono text-[10px]">{hex}</td>
                                    <td className="p-2">
                                      <div className="w-6 h-6 rounded-full border border-outline/20" style={{ backgroundColor: hex }} />
                                    </td>
                                    <td className="p-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = { ...editingProduct.colorCodes };
                                          delete updated[color];
                                          setEditingProduct({ ...editingProduct, colorCodes: updated });
                                        }}
                                        className="text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-1"
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-2 text-center bg-surface-container-low border border-dashed border-outline/20 rounded-xl text-on-surface-variant/60 text-[10px]">
                            No color codes defined.
                          </div>
                        )}
                        <div className="flex gap-2 items-end">
                          <div className="flex-1 space-y-0.5">
                            <label className="text-[8px] text-on-surface-variant/70 block">Color Name</label>
                            <input
                              type="text"
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              placeholder="e.g. Midnight Black"
                              className="w-full px-2 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="w-28 space-y-0.5">
                            <label className="text-[8px] text-on-surface-variant/70 block">Hex Code</label>
                            <input
                              type="text"
                              value={newColorCode}
                              onChange={(e) => setNewColorCode(e.target.value)}
                              placeholder="#1a1a1a"
                              className="w-full px-2 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px] font-mono"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={!newColorName.trim() || !newColorCode.trim()}
                            onClick={() => {
                              if (!newColorName.trim() || !newColorCode.trim()) return;
                              const updated = { ...editingProduct.colorCodes, [newColorName.trim()]: newColorCode.trim() };
                              setEditingProduct({ ...editingProduct, colorCodes: updated });
                              setNewColorName("");
                              setNewColorCode("");
                            }}
                            className="py-1 px-3 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>

                      {/* Add new color swatch */}`;

const markerEndIdx = markerIdx + fullMarker.length;
const before = c.substring(0, markerEndIdx);
const after = c.substring(markerEndIdx);
writeFileSync("src/components/AdminView.tsx", before + newSection + after);
console.log("SUCCESS");
