-- SweetBite API — seed data
-- Safe to re-run — ON CONFLICT (name) skips cakes that already exist.

INSERT INTO cakes (name, short_desc, full_desc, price, tag, badge, image_url, gallery_urls)
VALUES
  (
    'Chocolate Dream',
    'Rich Belgian chocolate layers with silky ganache frosting.',
    'Layers of moist Belgian chocolate sponge, filled and finished with a silky dark chocolate ganache, topped with a glossy drip and a scatter of chocolate shards and truffles. A rich, indulgent centerpiece for any celebration.',
    12900,
    'Chocolate',
    'popular',
    'https://images.unsplash.com/photo-1535911765168-1fafc87dcfa3?w=600&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1535911765168-1fafc87dcfa3?w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80'
    ]
  ),
  (
    'Strawberry Bliss',
    'Fresh strawberries layered on a light vanilla cream sponge.',
    'A light vanilla cream sponge layered with fresh strawberries and a delicate whipped cream frosting. Bright, fruity, and not overly sweet — a favourite for spring birthdays and anniversaries.',
    3900,
    'Fruity',
    NULL,
    'https://cdn.pixabay.com/photo/2017/08/06/23/14/strawberry-2597402_640.jpg',
    ARRAY[
      'https://cdn.pixabay.com/photo/2017/08/06/23/14/strawberry-2597402_640.jpg',
      'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80'
    ]
  ),
  (
    'Lemon Velvet',
    'Tangy lemon curd folded into a buttery velvet crumb.',
    'Buttery velvet crumb folded with tangy lemon curd and finished with a light lemon glaze. Refreshing and citrus-forward — the cake we recommend when you want something a little different from chocolate or vanilla.',
    3600,
    'Citrus',
    'new',
    'https://cdn.pixabay.com/photo/2018/01/04/11/40/cake-3060458_640.jpg',
    ARRAY[
      'https://cdn.pixabay.com/photo/2018/01/04/11/40/cake-3060458_640.jpg',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80'
    ]
  ),
  (
    'Wedding Deluxe',
    'A stunning three-tier masterpiece for your special day.',
    'A three-tier centerpiece finished in smooth buttercream with delicate floral piping, built to order for your big day. Each tier can be a different flavour on request — message us with your vision and we''ll bring it to life.',
    12900,
    'Premium',
    NULL,
    'https://images.pexels.com/photos/34596959/pexels-photo-34596959.jpeg?auto=compress&cs=tinysrgb&w=600',
    ARRAY[
      'https://images.pexels.com/photos/34596959/pexels-photo-34596959.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80'
    ]
  ),
  (
    'Red Velvet',
    'Classic red velvet with rich cream cheese frosting.',
    'Classic red velvet sponge with a hint of cocoa, layered with rich cream cheese frosting. A timeless favourite that never goes out of style.',
    4200,
    'Classic',
    NULL,
    'https://cdn.pixabay.com/photo/2020/07/06/14/45/cake-5377289_640.jpg',
    ARRAY[
      'https://cdn.pixabay.com/photo/2020/07/06/14/45/cake-5377289_640.jpg',
      'https://images.unsplash.com/photo-1586985289906-406988974504?w=800&q=80'
    ]
  ),
  (
    'Caramel Crunch',
    'Salted caramel layers topped with golden praline crunch.',
    'Moist caramel sponge layered with salted caramel filling and topped with golden praline crunch for texture. Sweet, salty, and satisfying in every bite.',
    4500,
    'Caramel',
    'new',
    'https://images.unsplash.com/photo-1547414368-ac947d00b91d?w=400&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1547414368-ac947d00b91d?w=800&q=80',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80'
    ]
  )
ON CONFLICT (name) DO NOTHING;