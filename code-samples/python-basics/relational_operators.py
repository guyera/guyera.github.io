def main() -> None:
    print(1 == 1) # Prints True
    
    print(1 < 4) # Prints True
    
    print(1 > 4) # Prints False

    print(3+7 <= 10) # Prints True

    print(3 + 7 >= 11) # Prints False

    print(4 != 3) # Prints True

    # Some relational operators, such as ==, work on more than
    # just numeric expressions:

    print('Hello' == 'Hello') # Prints True

    print('Hello' != 'Hello') # Prints False

    # Of course, you can store the value of a relational
    # operation in a boolean variable:

    x = 'Hello' == 'Goodbye' # x is False
    print(x) # Prints False

if __name__ == '__main__':
    main()
