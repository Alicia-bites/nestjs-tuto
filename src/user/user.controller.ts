import { Controller, 
	Get, 
	Patch, 
	UseGuards,
	Body
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {

	constructor(private userService: UserService) {} // we export UserService through dependency injection

	@Get('me') // we define what we do when we have a request on the route 'users/me'
	getMe(@GetUser() user: User) { 
		return user;
	}

	@Patch()
	editUser(
		@GetUser('id') userId: number, 
		@Body() dto: EditUserDto) {
			return this.userService.editUser(userId, dto);
		}
}

