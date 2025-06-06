import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesAndPermissionsGuard } from '../guards/roles-and-permissions.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get('with-roles')
    findAllWithRoles() {
        return this.userService.findAllWithRolesAndPermissions();
    }

    @Get('by-email/:email')
    async getByEmail(@Param('email') email: string) {
        return this.userService.findByEmailWithRolesAndPermissions(email);
    }

    @Put(':id/roles')
    @Roles('superAdmin')
    updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto
    ) {
        return this.userService.updateUserRole(userId, updateUserRoleDto.roleId);
    }

}
