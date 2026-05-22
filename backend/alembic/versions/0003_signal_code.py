"""signal code

Revision ID: 0003_signal_code
Revises: 0002_archive_signals
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_signal_code"
down_revision = "0002_archive_signals"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("signals", sa.Column("code", sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column("signals", "code")
