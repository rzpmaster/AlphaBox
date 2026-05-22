"""subscription updated at

Revision ID: 0005_subscription_updated_at
Revises: 0004_paid_subscriptions
Create Date: 2026-05-22
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_subscription_updated_at"
down_revision = "0004_paid_subscriptions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("subscriptions", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))


def downgrade() -> None:
    op.drop_column("subscriptions", "updated_at")
