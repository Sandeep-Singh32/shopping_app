import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ProductRequiredRoles, Public } from 'src/guards/public.guard';
import { User } from './entities/user.entity';
import { UserInfo } from './decorators/user.decorator';
import { RoleGuard } from 'src/guards/product.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ProductRequiredRoles()
  @UseGuards(RoleGuard)
  @Post('seller')
  createSeller(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto, true);
  }

  @ProductRequiredRoles()
  @UseGuards(RoleGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Public()
  @Post('/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get('details')
  findOne(@Query('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('/userProfile')
  getUserProfie(@UserInfo() user: User) {
    return this.userService.findOne(user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('/profileDetails')
  getUserProfileByEntityManager(
    @UserInfo() user: User,
  ) {
    return this.userService.getUserProfileByEntityManager(user);
  }
}
