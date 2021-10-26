import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from './entity/User';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { MyContext } from './MyContext';

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
    res.cookie(
      'jid',
      sign({ userId: user.id }, 'OtherSecret', {
        /// accessToken should be for something short
        expiresIn: '7d',
      }),
      {
        // This way this cookie cannot be accessed by javascript
        httpOnly: true,
        // There are much more options avilable!!
      }
    );

    return {
      // We pass into sign what we want to store in a token as a first argument
      // 2nd is a secret to validate the token
      // 3rd is options
      accessToken: sign({ userId: user.id }, 'secret', {
        /// accessToken should be for something short
        expiresIn: '15m',
      }),
    };
  }
}
