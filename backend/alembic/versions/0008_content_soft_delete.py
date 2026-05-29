"""content soft delete

Revision ID: 0008_content_soft_delete
Revises: 0007_leader_verified
Create Date: 2026-05-29
"""

from alembic import op
import sqlalchemy as sa

revision = "0008_content_soft_delete"
down_revision = "0007_leader_verified"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("posts", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("signals", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("signals", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("signals", "deleted_at")
    op.drop_column("signals", "is_deleted")
    op.drop_column("posts", "deleted_at")
    op.drop_column("posts", "is_deleted")
