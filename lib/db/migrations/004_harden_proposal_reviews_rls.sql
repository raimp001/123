-- Harden proposal_reviews RLS to prevent broad table access.
-- Previous policy allowed FOR ALL USING (TRUE) to all roles.

ALTER TABLE proposal_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages proposal reviews" ON proposal_reviews;
DROP POLICY IF EXISTS "Reviewers can view own reviews" ON proposal_reviews;
DROP POLICY IF EXISTS "Reviewers can insert own reviews" ON proposal_reviews;
DROP POLICY IF EXISTS "Reviewers can update own reviews" ON proposal_reviews;

CREATE POLICY "Reviewers can view own reviews"
  ON proposal_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can insert own reviews"
  ON proposal_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update own reviews"
  ON proposal_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Service role manages proposal reviews"
  ON proposal_reviews FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);
