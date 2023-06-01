import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
	let app: INestApplication;
  	let prisma:PrismaService;

	beforeAll(async() => {
		const moduleRef =
		await Test.createTestingModule({
			imports : [AppModule],
		}).compile();
	
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
			}),
		);
		await app.init();
		await app.listen(3333);
		prisma = app.get(PrismaService);
		await prisma.cleanDb();
		pactum.request.setBaseUrl('http://localhost:3333');
	});

	afterAll(() => {
		app.close();
	})
	
	// The line describe('Auth', () => {}); is used in testing frameworks, 
	// such as Jest or Mocha, to define a test suite or a group of related test cases.
	// In this case, the string 'Auth' is passed as the first argument
	// to the describe() function, which serves as a description or title
	// for the test suite. It typically represents a specific functionality, 
	// module, or feature that is being tested. In this context, it suggests
	// that the tests inside this describe block are related to authentication.
	// The second argument to the describe() function is an anonymous function,
	// indicated by () => {}. This function serves as a container for the test
	// cases related to the authentication functionality. Test cases, also 
	// known as test specifications or test assertions, are defined within 
	// this function using functions like it(), test(), or expect().
	describe('Auth', () => {
		const dto: AuthDto = {
			email: 'a1@gmail.com',
			password: '123',
		};

		describe('Signup', () => {
			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						password: dto.password,
					})
					.expectStatus(400);
			});

			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						email: dto.email,
					})
					.expectStatus(400);
			});

			it('should throw if no body provided', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
					})
					.expectStatus(400);
			});

			it('should signup', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto)
					.expectStatus(201);
			});
		});

		describe('Signin', () => {
			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({
						password: dto.password,
					})
					.expectStatus(400);
			});

			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({
						email: dto.email,
					})
					.expectStatus(400);
			});

			it('should throw if no body provided', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({
					})
					.expectStatus(400);
			});

			it('should signin', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto)
					.expectStatus(200)
					.stores('userAt', 'access_token'); // will get the access token variable from the body and put it in userAt 
			});
		});
	});

	describe('User', () => {
		describe('Get Me', () => {
			it('should get current user', () => {
				return pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(200);
			});
		});
	
		describe('Edit user', () => {
			it('should edit user', () => {
				const dto: EditUserDto = {
					firstName: "Alicia",
					email: "alicia@code.com"
				};
	
				return pactum
					.spec()
					.patch('/users')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody(dto)
					.expectStatus(200)
					.expectBodyContains(dto.firstName)
					.expectBodyContains(dto.email);
			});
		});
	});
	
	
	describe('Bookmarks', () => {
		
		describe('Get empty bookmarks', () => {
		  it('should get bookmarks', () => {
			return pactum
			  .spec()
			  .get('/bookmarks')
			  .withHeaders({
				Authorization: 'Bearer $S{userAt}',
			  })
			  .expectStatus(200)
			  .expectBody([]);
		  });
		});

		describe('Create bookmark', () => {
			const dto: CreateBookmarkDto = {
				title: "First Bookmark",
				link: "https://openclassrooms.com/fr/courses/8039116-decouvrez-typescript",
			}
			it("should create bookmark", () => {
				return pactum
				.spec()
				.post('/bookmarks')
				.withHeaders({
				  Authorization: 'Bearer $S{userAt}',
				})
				.withBody(dto)
				.expectStatus(201)
				.stores('bookmarkId', 'id') // store the value of the response field id into a variable named bookmarkId
				.inspect();
			})
		});

		describe('Get bookmarks', () => {
			it('should get a bookmark', () => {
				return pactum
				  .spec()
				  .get('/bookmarks')
				  .withHeaders({
					Authorization: 'Bearer $S{userAt}',
				  })
				  .expectStatus(200)
				  .expectJsonLength(1); // the array Bookmark should have AT LEAST one entry
			  });
		});

		describe('Get bookmark by id', () => {
			it('should get a bookmark by id', () => {
				return pactum
				  .spec()
				  .get('/bookmarks/{id}')
				  .withPathParams('id', '$S{bookmarkId}')
				  .withHeaders({
					Authorization: 'Bearer $S{userAt}',
				  })
				  .expectStatus(200)
				  .expectBodyContains('$S{bookmarkId}');
			  });
		});

		describe('Edit bookmark by id', () => {
			
			const dto: EditBookmarkDto = {
				title: "toto",
				description: "yolo" 
			};

			it('should edit a bookmark by id', () => {
				return pactum
				  .spec()
				  .patch('/bookmarks/{id}')
				  .withPathParams('id', '$S{bookmarkId}')
				  .withHeaders({
					Authorization: 'Bearer $S{userAt}',
				  })
				  .withBody(dto)
				  .expectStatus(200)
				  .expectBodyContains(dto.title)
				  .expectBodyContains(dto.description)
			  });
		});

		describe('Delete bookmark by id', () => {
			it('should delete a bookmark by id', () => {
				return pactum
				  .spec()
				  .delete('/bookmarks/{id}')
				  .withPathParams('id', '$S{bookmarkId}')
				  .withHeaders({
					Authorization: 'Bearer $S{userAt}',
				  })
				  .expectStatus(204)
				//   .inspect();
			  });

			it('should get empty bookmark', () => {
				return pactum
				.spec()
				.get('/bookmarks')
				.withHeaders({
				  Authorization: 'Bearer $S{userAt}',
				})
				.expectStatus(200)
				.expectJsonLength(0);
			});
		});

	});

})