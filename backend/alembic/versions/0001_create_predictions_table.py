from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "predictions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("features", sa.JSON, nullable=False),
        sa.Column("probability", sa.Float, nullable=False),
        sa.Column("decision", sa.String(16), nullable=False),
        sa.Column("threshold", sa.Float, nullable=False),
        sa.Column("feature_names", sa.JSON, nullable=False),
        sa.Column("shap_values", sa.JSON, nullable=False),
        sa.Column("base_value", sa.Float, nullable=False),
        sa.Column("model_version", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("predictions")