import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

// With @ObjectType() we can use this as a type!
@ObjectType()
// BaseEntity allows us to to stugg like user.save(). It's called active record pattern
@Entity('users')
export class User extends BaseEntity {
  // @Field() exposes what we want to show in a class type!
  @Field(() => Int) // () => Int says explicitly what we return
  @PrimaryGeneratedColumn()
  id: number;
  // 'text' tells explicitly what type are collumns, but it's inferred
  // it says it's a postgres text column
  @Field()
  @Column('text')
  email: string;

  @Column()
  password: string;
}
