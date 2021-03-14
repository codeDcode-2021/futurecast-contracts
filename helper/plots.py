"""Distributed Market Simulation"""
import matplotlib.pyplot as plt
from random import uniform
plt.rcParams["figure.figsize"] = [10, 6]

n = 100
my_name = [i for i in range(n)]
my_stake = {}
for i in range(n):
  my_stake[i] =  uniform(0, 100)

# """Decide my_reward"""
my_reward = {}
for i in range(n):
  my_reward[i] = my_stake[i]+10

plt.plot(my_name, list(my_stake.values()))
plt.plot(my_name, list(my_reward.values()))
plt.show()


"""Reward distribution"""
# (y - min)(max - min) # Normalization
n = 100
y = [i**5 for i in range(n)]
nmax = max(y)
nmin = min(y)

fmax = 100
fmin = 0.5
for i in range(len(y)):
  y[i] = fmin+(fmax-fmin)*((y[i] - nmin)/(nmax-nmin))
  y[i] = round(y[i], 4)
  
x = [i for i in range(n)]
plt.title("Platform fee over time")
plt.xlabel("No. of days")
plt.ylabel("Fee in percentage(%)")
plt.plot(x, y)
plt.show()


"""Reward and staking over time"""

n = 1000
y = [i**5 for i in range(n)]

nmax = max(y)
nmin = min(y)
for i in range(n):
  y[i] = (y[i] - nmin)/(nmax-nmin)

user_input = []
stake_pool = {} ## prize distribution pool
fees_pool = [] ## Validation rewards pool

for i in range(n):
  amount = uniform(100, 120)
  user_input.append(amount)
  rate = y[i]*100
  
  fp = (rate*amount)/100
  sp = amount - fp
  stake_pool[i] = sp
  fees_pool.append(fp)  

X = [i for i in range(n)]
plt.plot(X, user_input, label='Amount')
plt.plot(X, list(stake_pool.values()), label='Stake')
plt.title("Results of staking over time")
plt.xlabel("Time =>")
plt.ylabel("Amount of money =>")
plt.plot(X, fees_pool, label='Fee')
plt.legend()
plt.show()