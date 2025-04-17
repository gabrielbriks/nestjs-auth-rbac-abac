import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable, Scope } from '@nestjs/common';
import { Post, Roles, User } from '@prisma/client';

export type PermActions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type PermissionResource = Subjects<{ User: User; Post: Post }> | 'all';

export type AppAbility = PureAbility<
  [PermActions, PermissionResource],
  PrismaQuery
>;

export type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

//Mapeamento de permissões de cada role
const rolePermissionsMap: Record<Roles, DefinePermissions> = {
  ADMIN(user, { can }) {
    can('manage', 'all');
  },
  EDITOR(user, { can }) {
    can('create', 'Post');
    can('read', 'Post');
    can('update', 'Post');
  },
  WRITER(user, { can }) {
    can('create', 'Post');
    can('read', 'Post', { authorId: user.id });
    can('update', 'Post', { authorId: user.id });
  },
  READER(user, { can }) {
    can('read', 'Post', { published: true });
  },
};

/**
 * A abordagem utilizada com o casl permite que ocorra uma refatoração nas permissões
 * de forma que não provoque problemas com as tratativas existentes/implementadas
 */

//O uso do scope como request, sinaliza que essa classe será instanciada para cada request
@Injectable({ scope: Scope.REQUEST })
export class CaslAbilityService {
  ability: AppAbility;

  createForUser(user: User) {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    /**
     * Utilizando abordagem de carregar as permissões para inserir no token. para nao ficar pegando toda vez do banco
     * Claro, que deve ser levado em consideração o tando de permissões tem que ser avaliado o uso dessa pratica,
     * visto que o payload é carregado em todas as requisições, podendo provocar latências e etc.
     */

    //@ts-expect-error permissionsWithForEach
    user.permissions?.forEach((perm: any) => {
      builder.can(perm.action, perm.resource, perm.condition);
    });

    rolePermissionsMap[user.role](user, builder);
    this.ability = builder.build();

    return this.ability;
  }
}
