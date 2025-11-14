import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserService } from './user.service';
import { Roles } from '../decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🔹 Liste des utilisateurs avec leurs rôles et permissions
  @Get('with-roles')
  findAllWithRoles() {
    return this.userService.findAllWithRolesAndPermissions();
  }

  // 🔹 Recherche d’un utilisateur par email
  @Get('by-email/:email')
  async getByEmail(@Param('email') email: string) {
    return this.userService.findByEmailWithRolesAndPermissions(email);
  }

  // 🔹 Mise à jour du rôle d’un utilisateur
  @Put(':id/roles')
  @Roles('superAdmin')
  updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole(userId, updateUserRoleDto.roleId);
  }

  // ✅ Création d’un utilisateur
  @Post('create')
  @Roles('superAdmin')
  async createUser(
  @Body() body: { email: string; password: string; roleId: number },
  ) {
    const user = await this.userService.createUser(body.email, body.password, body.roleId);
    return { message: 'Utilisateur créé avec succès', user };
  }
}
