const pool = require('../config/db');

function toPublicCake(row) {
  return {
    id: row.id,
    name: row.name,
    shortDesc: row.short_desc,
    fullDesc: row.full_desc,
    price: row.price,
    tag: row.tag,
    badge: row.badge,
    imageUrl: row.image_url,
    galleryUrls: row.gallery_urls,
    isAvailable: row.is_available,
    createdAt: row.created_at,
  };
}

async function listCakes(req, res) {
  const { tag, includeUnavailable } = req.query;

  const conditions = [];
  const params = [];

  if (tag && tag !== 'All') {
    params.push(tag);
    conditions.push(`tag = $${params.length}`);
  }
  if (includeUnavailable !== 'true') {
    conditions.push('is_available = true');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM cakes ${where} ORDER BY created_at DESC`,
    params
  );

  res.json({ cakes: result.rows.map(toPublicCake) });
}

async function getCake(req, res) {
  const result = await pool.query('SELECT * FROM cakes WHERE id = $1', [req.params.id]);
  const cake = result.rows[0];
  if (!cake) {
    return res.status(404).json({ error: 'Cake not found.' });
  }
  res.json({ cake: toPublicCake(cake) });
}

async function createCake(req, res) {
  const { name, shortDesc, fullDesc, price, tag, badge, imageUrl, galleryUrls } = req.body;

  const result = await pool.query(
    `INSERT INTO cakes (name, short_desc, full_desc, price, tag, badge, image_url, gallery_urls)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, shortDesc, fullDesc, price, tag, badge || null, imageUrl, galleryUrls || []]
  );

  res.status(201).json({ cake: toPublicCake(result.rows[0]) });
}

async function updateCake(req, res) {
  const { name, shortDesc, fullDesc, price, tag, badge, imageUrl, galleryUrls, isAvailable } = req.body;

  const result = await pool.query(
    `UPDATE cakes SET
       name          = COALESCE($1, name),
       short_desc    = COALESCE($2, short_desc),
       full_desc     = COALESCE($3, full_desc),
       price         = COALESCE($4, price),
       tag           = COALESCE($5, tag),
       badge         = COALESCE($6, badge),
       image_url     = COALESCE($7, image_url),
       gallery_urls  = COALESCE($8, gallery_urls),
       is_available  = COALESCE($9, is_available)
     WHERE id = $10
     RETURNING *`,
    [
      name || null,
      shortDesc || null,
      fullDesc || null,
      price ?? null,
      tag || null,
      badge === undefined ? null : badge,
      imageUrl || null,
      galleryUrls || null,
      isAvailable ?? null,
      req.params.id,
    ]
  );

  const cake = result.rows[0];
  if (!cake) {
    return res.status(404).json({ error: 'Cake not found.' });
  }
  res.json({ cake: toPublicCake(cake) });
}

async function deleteCake(req, res) {
  const result = await pool.query('DELETE FROM cakes WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Cake not found.' });
  }
  res.status(204).send();
}

module.exports = { listCakes, getCake, createCake, updateCake, deleteCake };