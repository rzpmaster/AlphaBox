"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "invitation_codes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(length=64), nullable=False, unique=True, index=True),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("used_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "leaders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("handle", sa.String(length=80), nullable=False, unique=True, index=True),
        sa.Column("headline", sa.String(length=180), nullable=False),
        sa.Column("bio", sa.Text(), nullable=False),
        sa.Column("strategy", sa.String(length=120), nullable=False),
        sa.Column("risk_level", sa.String(length=32), nullable=False),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("leader_id", sa.Integer(), sa.ForeignKey("leaders.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "leader_id", name="uq_user_leader_subscription"),
    )
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("leader_id", sa.Integer(), sa.ForeignKey("leaders.id"), nullable=False, index=True),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "signals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("leader_id", sa.Integer(), sa.ForeignKey("leaders.id"), nullable=False, index=True),
        sa.Column("symbol", sa.String(length=32), nullable=False, index=True),
        sa.Column("side", sa.String(length=16), nullable=False),
        sa.Column("thesis", sa.Text(), nullable=False),
        sa.Column("entry", sa.Numeric(precision=18, scale=6), nullable=True),
        sa.Column("target", sa.Numeric(precision=18, scale=6), nullable=True),
        sa.Column("stop_loss", sa.Numeric(precision=18, scale=6), nullable=True),
        sa.Column("timeframe", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("signals")
    op.drop_table("posts")
    op.drop_table("subscriptions")
    op.drop_table("leaders")
    op.drop_table("invitation_codes")
    op.drop_table("users")
