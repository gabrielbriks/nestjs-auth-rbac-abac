# Prisma com NestJS - Boas Práticas e Considerações

## Uso do @Global() com Prisma

O uso do decorador `@Global()` no módulo do Prisma é uma abordagem comum e recomendada em projetos NestJS por várias razões:

1. **Acesso Global ao PrismaService**: 
   - Permite que o `PrismaService` seja injetado em qualquer módulo da aplicação sem necessidade de importações explícitas
   - Evita a repetição de imports em múltiplos módulos
   - Mantém o código mais limpo e DRY (Don't Repeat Yourself)

2. **Gerenciamento de Conexão Única**:
   - O Prisma trabalha melhor com uma única instância de conexão com o banco de dados
   - O `@Global()` garante que todos os módulos utilizem a mesma instância do `PrismaService`
   - Isso é crucial para o gerenciamento eficiente de conexões e recursos

## Boas Práticas com Prisma e NestJS

### 1. Estrutura do Módulo Prisma
```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 2. Gerenciamento de Conexão
- O `PrismaService` deve implementar `OnModuleInit` e `OnModuleDestroy` para gerenciar a conexão
- Garanta que a conexão seja fechada adequadamente quando o módulo for destruído

### 3. Injeção de Dependência
- Utilize o `PrismaService` através da injeção de dependência do NestJS
- Evite criar novas instâncias do PrismaClient manualmente

### 4. Transações
- Utilize transações para operações que precisam de atomicidade
- O Prisma oferece suporte nativo a transações através do `$transaction`

#### O que é Atomicidade?
Atomicidade é um dos princípios ACID (Atomicity, Consistency, Isolation, Durability) que garantem a confiabilidade das operações em bancos de dados. Especificamente:

- **Atomicidade** significa que uma transação é tratada como uma única unidade indivisível
- Todas as operações dentro da transação devem ser concluídas com sucesso, ou nenhuma delas será aplicada
- Se qualquer parte da transação falhar, todas as alterações são revertidas (rollback)

#### Exemplo Prático:
Imagine um sistema bancário onde você precisa transferir dinheiro entre duas contas:

```typescript
// Sem atomicidade (problema potencial)
await prisma.account.update({
  where: { id: contaOrigem },
  data: { saldo: { decrement: 100 } }
});

// Se houver erro aqui, o dinheiro já foi debitado da conta de origem
await prisma.account.update({
  where: { id: contaDestino },
  data: { saldo: { increment: 100 } }
});

// Com atomicidade (solução correta)
await prisma.$transaction(async (tx) => {
  await tx.account.update({
    where: { id: contaOrigem },
    data: { saldo: { decrement: 100 } }
  });

  await tx.account.update({
    where: { id: contaDestino },
    data: { saldo: { increment: 100 } }
  });
});
```

No exemplo com atomicidade:
- Se qualquer operação falhar, todas as alterações são revertidas
- O saldo das contas permanece consistente
- Não há risco de perder dinheiro no processo

### 5. Tratamento de Erros
- Implemente tratamento de erros específicos do Prisma
- Utilize interceptors para padronizar o tratamento de erros

### 6. Tipagem
- Aproveite a tipagem forte que o Prisma oferece
- Mantenha os tipos sincronizados com o schema do banco de dados

### 7. Migrações
- Mantenha um histórico de migrações
- Utilize o comando `prisma migrate` para gerenciar alterações no schema
- Nunca modifique o banco de dados diretamente sem migrações

### 8. Performance
- Utilize `select` para especificar apenas os campos necessários
- Implemente paginação para grandes conjuntos de dados
- Considere o uso de índices para otimizar consultas frequentes

### 9. Segurança
- Nunca exponha diretamente o `PrismaService` em endpoints públicos
- Implemente validação de dados antes de operações no banco
- Utilize middlewares do Prisma para auditoria e validação

## Conclusão

O uso do `@Global()` com o Prisma em NestJS é uma prática recomendada que simplifica o desenvolvimento e mantém a consistência da aplicação. No entanto, é importante seguir as boas práticas mencionadas acima para garantir um código robusto, seguro e eficiente.

Lembre-se que, embora o `@Global()` facilite o acesso ao `PrismaService`, é crucial manter uma arquitetura bem organizada e seguir os princípios SOLID para garantir a manutenibilidade do código. 