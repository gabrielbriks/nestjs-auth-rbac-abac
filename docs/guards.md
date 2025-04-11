# Guards no NestJS

## O que são Guards?

Guards são classes que implementam a interface `CanActivate` e são responsáveis por determinar se uma requisição deve ou não ser processada por uma rota específica. Eles funcionam como "guardiões" que protegem as rotas, verificando condições específicas antes de permitir o acesso.

## Características Principais

1. **Execução**: Os Guards são executados após os middlewares e antes dos interceptors
2. **Propósito**: São usados principalmente para autenticação e autorização
3. **Implementação**: Devem implementar o método `canActivate()`
4. **Retorno**: Devem retornar um valor booleano, uma Promise ou um Observable

## Como Criar um Guard

Para criar um guard, você pode usar o comando:

```bash
nest g guard auth
```

Este comando gera um arquivo com a seguinte estrutura básica:

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
```

## Implementação Prática

Um exemplo de implementação de um guard de autenticação seria:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## Aplicação do Guard

Os guards podem ser aplicados em diferentes níveis:

1. **Nível de Rota**:
```typescript
@Get('profile')
@UseGuards(AuthGuard)
getProfile() {
  // ...
}
```

2. **Nível de Controlador**:
```typescript
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  // ...
}
```

3. **Nível Global**:
```typescript
// No arquivo main.ts
app.useGlobalGuards(new AuthGuard());
```

## Contexto de Execução

O parâmetro `ExecutionContext` fornece informações sobre o contexto atual da requisição, permitindo:

- Acessar o objeto Request
- Obter informações sobre o controlador e o método
- Acessar metadados personalizados

## Boas Práticas

1. **Separação de Responsabilidades**: Mantenha a lógica de autenticação e autorização separadas
2. **Reutilização**: Crie guards específicos para diferentes tipos de proteção
3. **Tratamento de Erros**: Implemente tratamento adequado de erros
4. **Performance**: Evite operações pesadas dentro dos guards
5. **Testabilidade**: Mantenha os guards testáveis e isolados

## Integração com Autenticação

No contexto de autenticação, os guards são frequentemente usados em conjunto com:

- JWT (JSON Web Tokens)
- Passport.js
- Estratégias de autenticação personalizadas
- Middlewares de autenticação

## Exemplo de Fluxo Completo

1. Cliente faz requisição
2. Middleware processa a requisição
3. Guard verifica autenticação/autorização
4. Se aprovado, a requisição prossegue
5. Se rejeitado, uma exceção é lançada

## Conclusão

Guards são componentes essenciais no NestJS para implementar autenticação e autorização de forma eficiente e organizada. Eles permitem um controle granular sobre o acesso às rotas e podem ser facilmente integrados com diferentes estratégias de autenticação. 