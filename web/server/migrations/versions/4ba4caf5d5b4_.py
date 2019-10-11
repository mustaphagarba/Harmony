"""Add modification/creation times for records in the history table

Revision ID: 4ba4caf5d5b4
Revises: afa5069f67d0
Create Date: 2019-05-22 23:54:07.211803

"""
from alembic import op
import sqlalchemy as sa

#pylint: disable=C0301
#pylint: disable=C0103
#pylint: disable=E1101
# revision identifiers, used by Alembic.
revision = '4ba4caf5d5b4'
down_revision = 'afa5069f67d0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('history_records', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created', sa.DateTime(), server_default=sa.text(u'now()'), nullable=False))
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key('valid_user', 'user', ['user_id'], ['id'], ondelete='RESTRICT')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('history_records', schema=None) as batch_op:
        batch_op.drop_constraint('valid_user', type_='foreignkey')
        batch_op.drop_column('user_id')
        batch_op.drop_column('created')
    # ### end Alembic commands ###
