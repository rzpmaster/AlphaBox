"""leader verified

Revision ID: 0007_leader_verified
Revises: 0006_subscription_periods
Create Date: 2026-05-22
"""

from alembic import op
import sqlalchemy as sa

revision = "0007_leader_verified"
down_revision = "0006_subscription_periods"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leaders", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column("leaders", "is_verified")
