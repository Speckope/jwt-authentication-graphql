import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { User } from './entity/User';
import { compare, hash } from 'bcryptjs';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuthMiddleware';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

// we use type-graphql for easier wotk with ts.
@Resolver()
export class UserResolver {
  // We now easily code type a query returns!
  @Query(() => String)
  hello() {
    return 'hi';
  }
  // ABOVE IS EQUIVALENT TO THIS
  // const apolloServer = new ApolloServer({
  //     typeDefs: `
  //       type Query {
  //           hello: String!
  //       }
  //       `,
  //     resolvers: {
  //       Query: {
  //         hello: () => 'hello world',
  //       },
  //     },
  //   });

  @Query(() => String)
  // We will be using middleware to make authentication easier!
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    console.log(payload);
    // It sohuld be there, if it's not, middleware before will throw an error!
    return `You user id is ${payload.userId}`;
  }

  // FIND USER BY EMAIL
  @Query(() => User)
  async findUser(@Arg('email') email: string) {
    const user = await User.findOne({
      email,
    });

    return user;
  }

  // FIND ALL USERS
  @Query(() => [User])
  async user() {
    return await User.find();
  }

  // Normally you don't want to expose this mutation
  // Here it's hfor testing
  // Instead create a function for when nuser forgets a password
  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
    // This is how we can increment in TypeORM!
    // Now when we call this, tokenVersion will increment on user in database,
    // but it will stay the same in token until user gets a new one!.
    // We can use it when user changes a password or somethig like that!!
    // So once user gets new RefreshToken he won't be alb eto authenticate with it.
    // He can only use current accessToken he has(max 15m)
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1);

    return true;
  }

  // We create mutations when we want to modify data in some way
  @Mutation(() => Boolean) //() => Boolean tells what this mutation returns
  // Pass arguments we take name of our mutation
  async register(
    // 'email' is name of a variable user passes
    // () => String explicitly says this argument is of type string. (though type-graphql can infer this)
    // email is how we call this variable
    // string is type
    @Arg('email', () => String) email: string,
    @Arg('password') password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }

  // LOGIN
  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid password');
    }

    // LOGIN SUCCESS
    // Send cookie back to the web
    // name your cookie some generic id name, so noone knows what it is!
    // Refresh Token!
    sendRefreshToken(res, createRefreshToken(user));

    return {
      // We pass into sign what we want to store in a token as a first argument
      // 2nd is a secret to validate the token
      // 3rd is options
      accessToken: createAccessToken(user),
    };
  }
}
