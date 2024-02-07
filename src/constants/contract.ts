export const PROGRAM_STRING = `
# Public Input: [map_length, map_width, shortest-_path_length, start_and_end_coordinate,
#                obstacle_number, obstacle_coordinates]
#
#               test data of stack display:
#               ["8", "8", "14", "1", "1", "8", "7", "11", "1", "5", "3", "1", "3", "3", "3", "5", "4", "4", "4", "7", "5", "2", "6", "6", "6", "8", "7", "2", "8", "4"]
#               test data of real input(reverse display data):
#               ["4", "8", "2", "7", "8", "6", "6", "6", "2", "5", "7", "4", "4", "4", "5", "3", "3", "3", "1", "3", "5", "1", "11", "7", "8", "1", "1", "14", "8", "8"]
# Secret Input: [user_walk_coordinates]
#               ["1", "1", "1", "2", "2", "2", "3", "2", "4", "2", "4", "3", "5", "3", "6", "3", "7", "3", "7", "4", "7", "5", "7", "6", "7", "7", "8", "7"]

proc.store_maze_info
    # store map length and width
    push.0 dup mem_storew.100 dropw

    # store path info and start-end coordinate
    mem_store.101
    mem_storew.102 dropw

    # store obstacle number
    mem_store.200

    # store obstacle index
    push.1 mem_store.10

    push.1
    while.true
        # store obstacle coordinate
        push.0.0 mem_load.10 push.200 add mem_storew dropw
        
        # update obstacle counter number
        mem_load.10 add.1 mem_store.10

        # keep while loop going or ending
        push.1
        if.true
            mem_load.10 mem_load.200 lte
        end
    end
end

proc.check_start
    # load map start coordinate STACK: x_start, y_start, 0
    mem_loadw.102 movup.3 movup.3 drop drop

    # load user path coordinate STACK: y_user, x_user, x_start, y_start, 0
    push.0 dup dup dup mem_loadw.401 drop drop

    # move y_start to the top of stack STACK: y_start, y_user, x_user, x_start, 0
    movup.3

    # y_start eq y_user
    assert_eq

    # x_user eq x_start
    assert_eq
end

proc.read_store_coordinate_update_counter
    # update and store counter (counter + 1)
    mem_load.11 push.1 add mem_store.11

    # read and store coordinate
    adv_push.2 push.0 dup mem_load.11 push.400 add mem_storew dropw
end

proc.read_current_counter_index_coordinate
    # clear stack before implement this procedure
    # after implement it, STACK: x_user, y_user, 0
    mem_load.11 push.400 add mem_loadw drop drop swap
end

proc.check_obstacle_overlap
    # init counter
    push.1 movdn.2

    push.1
    while.true
        # duplicate user coordinate y and x
        dup.1 dup.1 padw

        # read obstacle coordinate STACK: x_o, y_o, x_u, y_u, ...
        dup.8 push.200 add mem_loadw drop drop

        # judge overlap STACK: x_u, x_o, y_o, y_u, ...
        movup.2 eq movdn.2 eq and assertz

        # update counter
        movup.2 push.1 add dup movdn.3 mem_load.200 lte
    end
    movup.2 drop
end

proc.check_map_boundary
    # dup user path coordinate
    dup.1 dup.1 padw

    # load mem_info STACK: map_length, map_width, x_u, y_u, x_u, y_u, 0
    mem_loadw.100 drop drop

    # STACK: y_u, map_length, map_width, x_u, x_u, y_u, 0
    movup.3

    # check boundary main logic
    gte movdn.2 lte and assert
end

proc.check_coordinate_consecutive
    # dup user path coordinate
    dup.1 dup.1 padw

    # calculate the previous coordinate STACK: y_before, x_before, x_now, y_now, x_now, y_now, 0
    mem_load.11 sub.1 push.400 add mem_loadw drop drop

    # STACK: y_now, y_before, x_before, x_now, x_now, y_now, 0
    movup.3

    dup.1 dup.1 lt
    if.true
        swap sub
    else
        sub
    end

    movdn.2
    dup.1 dup.1 lt
    if.true
        swap sub
    else
        sub
    end
    
    add push.1 assert_eq
end

proc.check_end
    # read map end coordinate STACK: x_end, y_end, x_u, y_u, 0
    padw push.102 mem_loadw drop drop

    # STACK: x_u, x_end, y_end, y_u, 0
    movup.2

    # judge whether current coordinate is map end coordinate
    # also, determine the while loop's loop condition
    eq movdn.2 eq and not
end

begin
  exec.store_maze_info
  
  # init 11
  push.1 mem_store.11

  # process first user path coordinate
  adv_push.2 push.0 dup mem_load.11 push.400 add mem_storew dropw

  # check whether the first user path coordinate is map start point
  exec.check_start

  # main loop
  push.1
  while.true
    exec.read_store_coordinate_update_counter

    # The module finishes running,
    # keeping the current path coordinates on the stack
    exec.read_current_counter_index_coordinate
    exec.check_obstacle_overlap
    exec.check_map_boundary
    exec.check_coordinate_consecutive
    exec.check_end
  end

  # compare user path length with map shortest path length
  # STACK: shortest_path_length user_path_length shortest_path_length user_path_length
  push.11 mem_load push.101 mem_load dup.1 dup.1
  
  # user_path_length must gte shortest_path_length
  gte assert

  # Final output: 1 is shortest path, 0 is normal path (gt shortest path)
  eq
end
`;

export const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "canisterAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddr", type: "address" }],
    name: "checkUserAchievement",
    outputs: [
      {
        internalType: "enum zkMazeVerify.Achievement",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "setCanisterAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "programHash", type: "string" }],
    name: "setProgramHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "signature", type: "bytes" },
      { internalType: "string", name: "programhash", type: "string" },
      { internalType: "string", name: "publicinput", type: "string" },
      { internalType: "string[]", name: "output", type: "string[]" },
    ],
    name: "verifyECDSASignature",
    outputs: [
      {
        internalType: "enum zkMazeVerify.Achievement",
        name: "acheiventment",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
