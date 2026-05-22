"""archive signals

Revision ID: 0002_archive_signals
Revises: 0001_initial
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_archive_signals"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("signals", sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("signals", sa.Column("exit_price", sa.Numeric(precision=18, scale=6), nullable=True))
    op.add_column("signals", sa.Column("return_rate", sa.Numeric(precision=12, scale=6), nullable=True))
    op.add_column("signals", sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("signals", "archived_at")
    op.drop_column("signals", "return_rate")
    op.drop_column("signals", "exit_price")
    op.drop_column("signals", "is_archived")
