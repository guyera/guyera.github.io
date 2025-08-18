def main() -> None:
    # Mypy is able to infer that this is a set of strings because,
    # later, we add a string to it
    my_set = set()

    # Here's where we add a string to the set
    my_set.add('John')

if __name__ == '__main__':
    main()
