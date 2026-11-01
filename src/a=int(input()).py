a=int(input())
b=int(input())
c=int(input())
if a==b==c:
    print("kõik arvud võrdsed")
if a==b and a!=c and c!=b:
    print("kaks arvud on võrdsed")
else:
    print("kõik on erinevad")