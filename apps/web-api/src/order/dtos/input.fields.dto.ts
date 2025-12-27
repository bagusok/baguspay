import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InputFieldDto {
  @ApiProperty({ example: 'id', description: 'Name of the input field' })
  @IsString()
  name: string;

  @ApiProperty({ example: '79132815', description: 'Value of the input field' })
  @IsString()
  value: string;
}
