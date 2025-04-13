# Decorators em JavaScript e NestJS

## O que são Decorators?

Decorators são uma funcionalidade do JavaScript (e TypeScript) que permite modificar ou adicionar comportamento a classes, métodos, propriedades ou parâmetros. Eles são uma forma de metaprogramação, permitindo que você modifique o comportamento de um elemento sem alterar seu código fonte.

## Sintaxe Básica

Em TypeScript, um decorator é uma função que pode ser aplicada a diferentes elementos usando o símbolo `@`:

```typescript
@decorator
class MinhaClasse {
  @decorator
  propriedade: string;

  @decorator
  metodo() {}
}
```

## Tipos de Decorators

1. **Class Decorators**: Aplicados a classes
2. **Method Decorators**: Aplicados a métodos
3. **Property Decorators**: Aplicados a propriedades
4. **Parameter Decorators**: Aplicados a parâmetros de métodos
5. **Accessor Decorators**: Aplicados a getters/setters

## Decorators no NestJS

O NestJS utiliza extensivamente decorators para implementar seu padrão arquitetural. Alguns exemplos comuns:

```typescript
@Controller('users')  // Define um controlador
@Injectable()        // Marca uma classe como injetável
@Get()              // Define um endpoint GET
@Post()             // Define um endpoint POST
@Param()            // Extrai parâmetros da URL
@Body()             // Extrai dados do corpo da requisição
```

## Exemplo Prático: RequiredRoles Decorator

No seu projeto atual, você implementou um decorator personalizado para controle de acesso baseado em roles:

```typescript
// required-roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Roles } from '@prisma/client';

export const RequiredRoles = (...roles: Roles[]) => SetMetadata('roles', roles);
```

Este decorator é utilizado no `UsersController`:

```typescript
@RequiredRoles(Roles.WRITER, Roles.EDITOR, Roles.READER)
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### Como funciona o RequiredRoles?

1. O decorator `RequiredRoles` recebe uma lista de roles como parâmetros
2. Utiliza o `SetMetadata` do NestJS para armazenar essas roles como metadados
3. Esses metadados são acessíveis posteriormente através do `Reflector` em guards ou interceptors

## Criando Seu Próprio Decorator

Para criar um decorator personalizado no NestJS, você pode:

1. Usar `SetMetadata` para armazenar informações
2. Criar um guard para verificar essas informações
3. Aplicar o decorator onde necessário

Exemplo de implementação:

```typescript
// 1. Criar o decorator
export const CustomDecorator = (value: string) => SetMetadata('custom', value);

// 2. Criar um guard para verificar
@Injectable()
export class CustomGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const value = this.reflector.get<string>('custom', context.getHandler());
    // Lógica de verificação
    return true;
  }
}

// 3. Usar o decorator
@CustomDecorator('valor')
@UseGuards(CustomGuard)
@Get()
findAll() {
  return this.service.findAll();
}
```

## Vantagens do Uso de Decorators

1. **Código Declarativo**: Torna o código mais legível e auto-documentado
2. **Reutilização**: Permite encapsular lógica comum
3. **Manutenção**: Facilita a manutenção ao centralizar comportamentos
4. **Flexibilidade**: Permite adicionar funcionalidades sem modificar o código original

## Boas Práticas

1. **Nomes Descritivos**: Use nomes que descrevam claramente a função do decorator
2. **Documentação**: Documente o propósito e uso do decorator
3. **Simplicidade**: Mantenha a lógica do decorator simples e focada
4. **Testabilidade**: Certifique-se que o decorator seja facilmente testável

## Exemplos Comuns no NestJS

1. **Validação**:
```typescript
@IsString()
@MinLength(3)
nome: string;
```

2. **Transformação**:
```typescript
@Transform(({ value }) => value.toLowerCase())
email: string;
```

3. **Autorização**:
```typescript
@Roles('admin')
@Get()
findAll() {
  return this.service.findAll();
}
```

## Conclusão

Decorators são uma ferramenta poderosa no desenvolvimento com NestJS, permitindo criar código mais limpo, modular e manutenível. Seu uso no controle de acesso (como no `RequiredRoles`) é um excelente exemplo de como eles podem ser utilizados para implementar funcionalidades complexas de forma elegante e reutilizável. 