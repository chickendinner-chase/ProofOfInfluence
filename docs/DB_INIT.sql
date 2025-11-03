-- ProofOfInfluence Database Initialization
-- POI Tier System and Fee Credits

-- Insert default POI tier levels
-- These tiers provide fee discounts and shipping credits based on POI holdings

INSERT INTO poi_tiers (name, min_poi, fee_discount_rate, shipping_credit_cap_cents) 
VALUES
  ('Lv1 - Bronze', 5000, 0.05, 5000),      -- 5,000 POI: -5% platform fee, $50 shipping credit
  ('Lv2 - Silver', 25000, 0.10, 15000),    -- 25,000 POI: -10% platform fee, $150 shipping credit
  ('Lv3 - Gold', 100000, 0.15, 30000)      -- 100,000 POI: -15% platform fee, $300 shipping credit
ON CONFLICT DO NOTHING;

-- Verify tier data
SELECT * FROM poi_tiers ORDER BY min_poi;

-- Note: User fee credit accounts are created automatically when needed
-- No manual initialization required for poi_fee_credits table

