'''Add user-specific Dashboard Metadata

Revision ID: afa5069f67d0
Revises: 3846793ccd75
Create Date: 2019-05-20 12:19:29.138943

'''
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'afa5069f67d0'
down_revision = '3846793ccd75'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('dashboard_user_metadata',
                    sa.Column('last_viewed', sa.DateTime(),
                              server_default=sa.text(u'now()'), nullable=True),
                    sa.Column('last_edited', sa.DateTime(), nullable=True),
                    sa.Column('is_favorite', sa.Boolean(),
                              server_default='false', nullable=False),
                    sa.Column('dashboard_id', sa.Integer(), nullable=False),
                    sa.Column('user_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['dashboard_id'], [
                        'dashboard.id'], name='valid_dashboard', ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(
                        ['user_id'], ['user.id'], name='valid_user', ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('dashboard_id', 'user_id')
                    )

    with op.batch_alter_table(u'dashboard', schema=None) as batch_op:
        batch_op.alter_column('is_important', new_column_name='is_official')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table(u'dashboard', schema=None) as batch_op:
        batch_op.alter_column('is_official', new_column_name='is_important')

    op.drop_table('dashboard_user_metadata')
    # ### end Alembic commands ###
