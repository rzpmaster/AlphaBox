"""subscription periods

Revision ID: 0006_subscription_periods
Revises: 0005_subscription_updated_at
Create Date: 2026-05-22
"""

from alembic import op
import sqlalchemy as sa

revision = "0006_subscription_periods"
down_revision = "0005_subscription_updated_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leaders", sa.Column("monthly_price", sa.Numeric(10, 2), nullable=False, server_default="0.00"))
    op.add_column("leaders", sa.Column("yearly_price", sa.Numeric(10, 2), nullable=False, server_default="0.00"))
    op.add_column("subscriptions", sa.Column("billing_period", sa.String(length=16), nullable=False, server_default="monthly"))
    op.add_column("subscriptions", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("subscriptions", "expires_at")
    op.drop_column("subscriptions", "billing_period")
    op.drop_column("leaders", "yearly_price")
    op.drop_column("leaders", "monthly_price")
