---
layout: null
---
/* Drug names and ids, so guide results can link drug names to the antibiotics page. Source: _data/abx_links.json */
window.ABX_INDEX = {{ site.data.abx_links.index | jsonify }};
window.ABX_ORAL = {{ site.data.abx_links.oral | jsonify }};
