import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

// for any class in NestJs,
// to user dependency injection
// you need the @Injectable decorator
@Injectable()
export class PrismaService extends PrismaClient {
	constructor(config: ConfigService) {
		super({ // call the constructor of the parent class PrismaClient 
			datasources: {
				db: {
					url: config.get('DATABASE_URL'),
				},
			},
		});
		// console.log(config.get('DATABASE_URL'));
	}

	// instead of using onDelete: Cascade in the shema.prisma file when the @relation is defined
	// this methode clean the database
	cleanDb() {
		return this.$transaction([ // to guarantee it will delete bookmark BEFORE user
			this.bookmark.deleteMany(), // deleteMany --> delete all the records from the respective tables.
			this.user.deleteMany(),
		]);
	}

}