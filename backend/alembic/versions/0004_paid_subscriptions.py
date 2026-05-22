"""paid subscriptions

Revision ID: 0004_paid_subscriptions
Revises: 0003_signal_code
Create Date: 2026-05-22
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_paid_subscriptions"
down_revision = "0003_signal_code"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leaders", sa.Column("subscription_price", sa.Numeric(10, 2), nullable=False, server_default="0.00"))
    op.add_column("subscriptions", sa.Column("amount", sa.Numeric(10, 2), nullable=False, server_default="0.00"))
    op.add_column("subscriptions", sa.Column("status", sa.String(length=32), nullable=False, server_default="paid"))
    op.add_column("subscriptions", sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("subscriptions", "paid_at")
    op.drop_column("subscriptions", "status")
    op.drop_column("subscriptions", "amount")
    op.drop_column("leaders", "subscription_price")
